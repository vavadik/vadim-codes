import { reactive } from 'vue';
import { useEditorStore } from '@/stores/editor';
import { useCanvasScale } from './useCanvasScale';
import { createNode } from '@/editor/utils/nodeFactory';
import type { NodeKind, ContainerNode, EditorNode } from '@/editor/types';

export interface DragState {
  active: boolean;
  nodeId: string | null;
  ghostX: number; // px, viewport-fixed (element TL position)
  ghostY: number;
  grabOffsetX: number; // px — cursor offset from element TL at mousedown
  grabOffsetY: number;
  startNodeX: number; // mm
  startNodeY: number; // mm
  startMouseX: number; // px, clientX
  startMouseY: number; // px, clientY
  overContainerId: string | null;
  insertIndex: number | null; // insert position within overContainerId (excl. dragged node)
  cursorPageXMm: number; // cursor position on the page in mm
  cursorPageYMm: number;
}

const drag = reactive<DragState>({
  active: false,
  nodeId: null,
  ghostX: 0,
  ghostY: 0,
  grabOffsetX: 0,
  grabOffsetY: 0,
  startNodeX: 0,
  startNodeY: 0,
  startMouseX: 0,
  startMouseY: 0,
  overContainerId: null,
  insertIndex: null,
  cursorPageXMm: 0,
  cursorPageYMm: 0,
});

// The canvas page element — registered by CanvasPage on mount for cursor→mm conversion.
let _pageEl: HTMLElement | null = null;

export function registerPageEl(el: HTMLElement): void {
  _pageEl = el;
}

export function useDragDrop() {
  const store = useEditorStore();
  const { toMm } = useCanvasScale();

  function getCursorMm(clientX: number, clientY: number): { x: number; y: number } {
    if (!_pageEl) {
      return { x: 0, y: 0 };
    }
    const rect = _pageEl.getBoundingClientRect();
    return { x: toMm(clientX - rect.left), y: toMm(clientY - rect.top) };
  }

  // ------- Palette drop (HTML5 DnD) -------

  function onPaletteDragOver(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
  }

  function onPaletteDrop(e: DragEvent, pageEl: HTMLElement) {
    e.preventDefault();
    const kind = e.dataTransfer?.getData('editor/kind') as NodeKind | undefined;
    if (!kind) {
      return;
    }

    const rect = pageEl.getBoundingClientRect();
    const dropXpx = e.clientX - rect.left;
    const dropYpx = e.clientY - rect.top;
    const dropXmm = toMm(dropXpx);
    const dropYmm = toMm(dropYpx);

    // Hit-test: is the drop point inside any container?
    const targetContainer = findContainerAt(dropXmm, dropYmm, null);

    if (targetContainer) {
      const node = createNode(kind, { parentId: targetContainer.id, x: 0, y: 0 });
      store.addNode(node);
    } else {
      const node = createNode(kind, { parentId: null, x: dropXmm, y: dropYmm });
      store.addNode(node);
    }
    store.selectNode(store.rootIds.at(-1) ?? '');
  }

  // ------- Element drag (mouse events) -------

  function startNodeDrag(nodeId: string, e: MouseEvent, el: HTMLElement) {
    const node = store.getNode(nodeId);
    if (!node) {
      return;
    }

    const rect = el.getBoundingClientRect();
    drag.grabOffsetX = e.clientX - rect.left;
    drag.grabOffsetY = e.clientY - rect.top;

    drag.active = true;
    drag.nodeId = nodeId;
    drag.startNodeX = node.x;
    drag.startNodeY = node.y;
    drag.startMouseX = e.clientX;
    drag.startMouseY = e.clientY;
    drag.ghostX = rect.left;
    drag.ghostY = rect.top;
    drag.overContainerId = null;
    drag.insertIndex = null;

    const cursorMm = getCursorMm(e.clientX, e.clientY);
    drag.cursorPageXMm = cursorMm.x;
    drag.cursorPageYMm = cursorMm.y;

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp, { once: true });
  }

  function onMouseMove(e: MouseEvent) {
    if (!drag.active || !drag.nodeId) {
      return;
    }

    drag.ghostX = e.clientX - drag.grabOffsetX;
    drag.ghostY = e.clientY - drag.grabOffsetY;

    const cursorMm = getCursorMm(e.clientX, e.clientY);
    drag.cursorPageXMm = cursorMm.x;
    drag.cursorPageYMm = cursorMm.y;

    const targetContainer = findContainerAt(cursorMm.x, cursorMm.y, drag.nodeId);
    drag.overContainerId = targetContainer?.id ?? null;

    if (targetContainer) {
      drag.insertIndex = computeInsertIndex(targetContainer, cursorMm, drag.nodeId);
    } else {
      drag.insertIndex = null;
    }
  }

  function onMouseUp(e: MouseEvent) {
    if (!drag.active || !drag.nodeId) {
      return;
    }

    const nodeId = drag.nodeId;
    const node = store.getNode(nodeId);
    const cursorMm = getCursorMm(e.clientX, e.clientY);

    const targetContainer = findContainerAt(cursorMm.x, cursorMm.y, nodeId);

    if (targetContainer) {
      const insertIdx = computeInsertIndex(targetContainer, cursorMm, nodeId);
      store.setParent(nodeId, targetContainer.id, insertIdx);
    } else if (node) {
      // Drop on the canvas — becomes / stays a root node
      const newX = Math.max(0, cursorMm.x - toMm(drag.grabOffsetX));
      const newY = Math.max(0, cursorMm.y - toMm(drag.grabOffsetY));
      if (node.parentId !== null) {
        store.setParent(nodeId, null);
      }
      store.updateNode(nodeId, { x: newX, y: newY });
    }

    drag.active = false;
    drag.nodeId = null;
    drag.overContainerId = null;
    drag.insertIndex = null;
    window.removeEventListener('mousemove', onMouseMove);
  }

  /**
   * Compute the insertion index within a container (relative to non-dragged children).
   * The index is the position in the childIds list after the dragged node has been removed.
   */
  function computeInsertIndex(
    container: ContainerNode,
    cursorMm: { x: number; y: number },
    excludeId: string | null
  ): number {
    const absPos = getAbsolutePos(container.id);
    const isRow = container.flexDirection === 'row' || container.flexDirection === 'row-reverse';

    const children = container.childIds
      .filter((id) => id !== excludeId)
      .map((id) => store.getNode(id))
      .filter((n): n is EditorNode => n !== undefined);

    const cursorRel = isRow ? cursorMm.x - absPos.x : cursorMm.y - absPos.y;

    for (let i = 0; i < children.length; i++) {
      const child = children[i]!;
      const midpoint = isRow ? child.x + child.width / 2 : child.y + child.height / 2;
      if (cursorRel < midpoint) {
        return i;
      }
    }

    return children.length;
  }

  // Hit-test: find the topmost container that contains (xMm, yMm),
  // excluding the dragged node and its descendants.
  function findContainerAt(
    xMm: number,
    yMm: number,
    excludeId: string | null
  ): ContainerNode | null {
    // Walk root containers (nested containers are checked via recursion)
    let best: ContainerNode | null = null;

    function checkContainer(container: ContainerNode): void {
      if (container.id === excludeId) {
        return;
      }
      const absPos = getAbsolutePos(container.id);
      if (
        xMm >= absPos.x &&
        xMm <= absPos.x + container.width &&
        yMm >= absPos.y &&
        yMm <= absPos.y + container.height
      ) {
        best = container;
        // Check nested containers (inner wins)
        for (const childId of container.childIds) {
          const child = store.getNode(childId);
          if (child?.kind === 'container') {
            checkContainer(child as ContainerNode);
          }
        }
      }
    }

    for (const id of store.rootIds) {
      const node = store.getNode(id);
      if (node?.kind === 'container') {
        checkContainer(node as ContainerNode);
      }
    }

    return best;
  }

  /** Compute absolute page position for any node (root or nested). */
  function getAbsolutePos(nodeId: string): { x: number; y: number } {
    const node = store.getNode(nodeId);
    if (!node) {
      return { x: 0, y: 0 };
    }
    if (node.parentId === null) {
      return { x: node.x, y: node.y };
    }
    const parent = getAbsolutePos(node.parentId);
    return { x: parent.x + node.x, y: parent.y + node.y };
  }

  return { drag, onPaletteDragOver, onPaletteDrop, startNodeDrag };
}
