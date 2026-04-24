import { markRaw } from 'vue';
import type { Component } from 'vue';
import { usePopupStore } from '@/stores/popup';

export function usePopup() {
  const store = usePopupStore();

  function open<TResult = undefined>(
    component: Component,
    props?: Record<string, unknown>
  ): Promise<TResult | undefined> {
    return new Promise<TResult | undefined>((resolve) => {
      store.push({
        component: markRaw(component),
        props: props ?? {},
        resolve: resolve as (value: unknown) => void,
      });
    });
  }

  return { open };
}
