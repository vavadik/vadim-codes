import { computed } from 'vue';
import { useEditorStore } from '@/stores/editor';

export const MM_TO_PX = 3.7795275591;

export function useCanvasScale() {
  const store = useEditorStore();

  const scale = computed(() => MM_TO_PX * store.zoom);

  function toPx(mm: number): number {
    return mm * scale.value;
  }

  function toMm(px: number): number {
    return px / scale.value;
  }

  return { scale, toPx, toMm };
}
