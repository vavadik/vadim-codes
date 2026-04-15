import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Component } from 'vue';

export interface PopupEntry {
  id: number;
  component: Component;
  props: Record<string, unknown>;
  resolve: (value: unknown) => void;
}

let nextId = 0;

export const usePopupStore = defineStore('popup', () => {
  const stack = ref<PopupEntry[]>([]);

  function push(entry: Omit<PopupEntry, 'id'>): number {
    const id = nextId++;
    stack.value.push({ ...entry, id });
    return id;
  }

  function pop(id: number, value: unknown = undefined): void {
    const index = stack.value.findIndex((e) => e.id === id);
    if (index === -1) return;
    const entry = stack.value[index];
    stack.value.splice(index, 1);
    entry?.resolve(value);
  }

  return { stack, push, pop };
});
