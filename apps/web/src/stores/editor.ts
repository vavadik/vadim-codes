import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { EditorNode, ContainerNode, PageDimensions, NodeKind } from '@/editor/types';

export const useEditorStore = defineStore('editor', () => {
  // ---- State ----
  const nodes = ref<Map<string, EditorNode>>(new Map());
  const rootIds = ref<string[]>([]); // z-ordered, no parent
  const selectedId = ref<string | null>(null);
  const layoutVersion = ref(0); // bumped on any layout-affecting mutation
  const page = ref<PageDimensions>({
    width: 210,
    height: 297,
    padding: [0, 0, 0, 0],
  });
  const zoom = ref(1);
  const showOutlines = ref(localStorage.getItem('editor-show-outlines') === 'true');

  // ---- Getters ----
  const selectedNode = computed(() =>
    selectedId.value ? (nodes.value.get(selectedId.value) ?? null) : null
  );

  function getNode(id: string): EditorNode | undefined {
    return nodes.value.get(id);
  }

  function getChildren(parentId: string): EditorNode[] {
    const parent = nodes.value.get(parentId);
    if (!parent || parent.kind !== 'container') {
      return [];
    }
    return (parent as ContainerNode).childIds
      .map((id) => nodes.value.get(id))
      .filter((n): n is EditorNode => n !== undefined);
  }

  /** Collect all node ids that are containers (any depth) */
  function getAllContainerIds(): string[] {
    const result: string[] = [];
    for (const [id, node] of nodes.value) {
      if (node.kind === 'container') {
        result.push(id);
      }
    }
    return result;
  }

  // ---- Mutations ----

  function bumpLayout() {
    layoutVersion.value++;
  }

  function addNode(node: EditorNode): void {
    nodes.value.set(node.id, node);
    if (node.parentId === null) {
      rootIds.value.push(node.id);
    } else {
      const parent = nodes.value.get(node.parentId);
      if (parent?.kind === 'container') {
        (parent as ContainerNode).childIds.push(node.id);
      }
    }
    if (node.parentId !== null) {
      bumpLayout();
    }
  }

  /**
   * Detach a node from its current parent/root and attach it to a new one.
   * newParentId = null → root level.
   */
  function setParent(nodeId: string, newParentId: string | null, index?: number): void {
    const node = nodes.value.get(nodeId);
    if (!node) {
      return;
    }

    // Detach from old location
    if (node.parentId === null) {
      rootIds.value = rootIds.value.filter((id) => id !== nodeId);
    } else {
      const oldParent = nodes.value.get(node.parentId);
      if (oldParent?.kind === 'container') {
        (oldParent as ContainerNode).childIds = (oldParent as ContainerNode).childIds.filter(
          (id) => id !== nodeId
        );
      }
    }

    node.parentId = newParentId;

    if (newParentId === null) {
      if (index !== undefined) {
        rootIds.value.splice(index, 0, nodeId);
      } else {
        rootIds.value.push(nodeId);
      }
    } else {
      const newParent = nodes.value.get(newParentId);
      if (newParent?.kind === 'container') {
        const childIds = (newParent as ContainerNode).childIds;
        if (index !== undefined) {
          childIds.splice(index, 0, nodeId);
        } else {
          childIds.push(nodeId);
        }
      }
    }

    bumpLayout();
  }

  function updateNode(id: string, patch: Partial<EditorNode>): void {
    const node = nodes.value.get(id);
    if (!node) {
      return;
    }
    const sizeChanged =
      'width' in patch || 'height' in patch || 'flexGrow' in patch || 'flexShrink' in patch;
    Object.assign(node, patch);
    if (sizeChanged && (node.parentId !== null || node.kind === 'container')) {
      bumpLayout();
    }
  }

  function updateFlex(id: string, patch: Partial<ContainerNode>): void {
    const node = nodes.value.get(id) as ContainerNode | undefined;
    if (!node || node.kind !== 'container') {
      return;
    }
    Object.assign(node, patch);
    bumpLayout();
  }

  /** Move a root-level node by delta (mm). Ignored for flex children. */
  function moveNode(id: string, dx: number, dy: number): void {
    const node = nodes.value.get(id);
    if (!node || node.parentId !== null) {
      return;
    }
    node.x = Math.max(0, node.x + dx);
    node.y = Math.max(0, node.y + dy);
  }

  /** Written by useYogaLayout after each layout pass. */
  function applyLayoutResults(
    results: { id: string; x: number; y: number; width: number; height: number }[]
  ): void {
    for (const r of results) {
      const node = nodes.value.get(r.id);
      if (node) {
        node.x = r.x;
        node.y = r.y;
        node.width = r.width;
        node.height = r.height;
      }
    }
  }

  function selectNode(id: string): void {
    selectedId.value = id;
  }

  function deselectAll(): void {
    selectedId.value = null;
  }

  function deleteNode(id: string): void {
    const node = nodes.value.get(id);
    if (!node) {
      return;
    }

    // Recursively delete children first
    if (node.kind === 'container') {
      for (const childId of (node as ContainerNode).childIds) {
        deleteNode(childId);
      }
    }

    // Detach from parent
    if (node.parentId === null) {
      rootIds.value = rootIds.value.filter((rid) => rid !== id);
    } else {
      const parent = nodes.value.get(node.parentId);
      if (parent?.kind === 'container') {
        (parent as ContainerNode).childIds = (parent as ContainerNode).childIds.filter(
          (cid) => cid !== id
        );
      }
    }

    nodes.value.delete(id);
    if (selectedId.value === id) {
      selectedId.value = null;
    }
    bumpLayout();
  }

  function setZoom(z: number): void {
    zoom.value = Math.min(4, Math.max(0.25, z));
  }

  function toggleOutlines(): void {
    showOutlines.value = !showOutlines.value;
    localStorage.setItem('editor-show-outlines', String(showOutlines.value));
  }

  return {
    // State
    nodes,
    rootIds,
    selectedId,
    layoutVersion,
    page,
    zoom,
    showOutlines,
    // Getters
    selectedNode,
    getNode,
    getChildren,
    getAllContainerIds,
    // Mutations
    addNode,
    setParent,
    updateNode,
    updateFlex,
    moveNode,
    applyLayoutResults,
    selectNode,
    deselectAll,
    deleteNode,
    setZoom,
    toggleOutlines,
  };
});

export type { NodeKind };
