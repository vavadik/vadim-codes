import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ElementType = 'text' | 'table' | 'block';

export interface EditorElement {
  id: string;
  type: ElementType;
  x: number; // mm
  y: number; // mm
  width: number; // mm
  height: number; // mm
  content: string;
}

export const useEditorStore = defineStore('editor', () => {
  const elements = ref<EditorElement[]>([]);

  function addElement(element: Omit<EditorElement, 'id'>) {
    elements.value.push({ ...element, id: crypto.randomUUID() });
  }

  function moveElement(id: string, x: number, y: number) {
    const el = elements.value.find((e) => e.id === id);
    if (el) {
      el.x = Math.max(0, x);
      el.y = Math.max(0, y);
    }
  }

  function removeElement(id: string) {
    elements.value = elements.value.filter((e) => e.id !== id);
  }

  return { elements, addElement, moveElement, removeElement };
});
