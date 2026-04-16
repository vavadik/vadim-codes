import { reactive } from 'vue';
import { useEditorStore } from '@/stores/editor';
import { useCanvasScale } from './useCanvasScale';
import { createNode } from '@/editor/utils/nodeFactory';
import type { NodeKind, ContainerNode } from '@/editor/types';

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
});

export function useDragDrop() {
  const store = useEditorStore();
  const { toMm } = useCanvasScale();

  // ------- Palette drop (HTML5 DnD) -------

  function onPaletteDragOver(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
  }

  function onPaletteDrop(e: DragEvent, pageEl: HTMLElement) {
    e.preventDefault();
    const kind = e.dataTransfer?.getData('editor/kind') as NodeKind | undefined;
    if (!kind) return;

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
    if (!node) return;

    // Flex children cannot be manually repositioned
    if (node.parentId !== null) return;

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

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp, { once: true });
  }

  function onMouseMove(e: MouseEvent) {
    if (!drag.active || !drag.nodeId) return;

    const dxPx = e.clientX - drag.startMouseX;
    const dyPx = e.clientY - drag.startMouseY;

    drag.ghostX = e.clientX - drag.grabOffsetX;
    drag.ghostY = e.clientY - drag.grabOffsetY;

    const newXmm = drag.startNodeX + toMm(dxPx);
    const newYmm = drag.startNodeY + toMm(dyPx);

    // Highlight containers under cursor
    drag.overContainerId = findContainerAt(newXmm, newYmm, drag.nodeId)?.id ?? null;
  }

  function onMouseUp(e: MouseEvent) {
    if (!drag.active || !drag.nodeId) return;

    const dxPx = e.clientX - drag.startMouseX;
    const dyPx = e.clientY - drag.startMouseY;
    const newXmm = drag.startNodeX + toMm(dxPx);
    const newYmm = drag.startNodeY + toMm(dyPx);

    const targetContainer = findContainerAt(newXmm, newYmm, drag.nodeId);

    if (targetContainer) {
      // Reparent into container — Yoga will position it
      store.setParent(drag.nodeId, targetContainer.id);
    } else {
      // Free move on page
      const node = store.getNode(drag.nodeId);
      if (node) {
        store.updateNode(drag.nodeId, {
          x: Math.max(0, newXmm),
          y: Math.max(0, newYmm),
        });
      }
    }

    drag.active = false;
    drag.nodeId = null;
    drag.overContainerId = null;
    window.removeEventListener('mousemove', onMouseMove);
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
      if (container.id === excludeId) return;
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
          if (child?.kind === 'container') checkContainer(child as ContainerNode);
        }
      }
    }

    for (const id of store.rootIds) {
      const node = store.getNode(id);
      if (node?.kind === 'container') checkContainer(node as ContainerNode);
    }

    return best;
  }

  /** Compute absolute page position for any node (root or nested). */
  function getAbsolutePos(nodeId: string): { x: number; y: number } {
    const node = store.getNode(nodeId);
    if (!node) return { x: 0, y: 0 };
    if (node.parentId === null) return { x: node.x, y: node.y };
    const parent = getAbsolutePos(node.parentId);
    return { x: parent.x + node.x, y: parent.y + node.y };
  }

  return { drag, onPaletteDragOver, onPaletteDrop, startNodeDrag };
}
