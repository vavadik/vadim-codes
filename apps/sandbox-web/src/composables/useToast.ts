import { ref } from 'vue';

export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

let nextId = 0;

export const toasts = ref<Toast[]>([]);

export function useToast() {
  function show(message: string, variant: ToastVariant = 'info', duration = 3000): void {
    const id = nextId++;
    toasts.value.push({ id, message, variant });
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, duration);
  }

  return { show, toasts };
}
