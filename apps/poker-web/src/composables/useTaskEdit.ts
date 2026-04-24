import { ref, nextTick } from 'vue';

export function useTaskEdit(
  getCurrentTask: () => string | undefined,
  onSave: (task: string) => void
) {
  const editing = ref(false);
  const draft = ref('');
  const inputRef = ref<HTMLInputElement | null>(null);

  function startEdit(): void {
    draft.value = getCurrentTask() ?? '';
    editing.value = true;
    nextTick(() => inputRef.value?.focus());
  }

  function save(): void {
    if (!editing.value) {
      return;
    }
    editing.value = false;
    const trimmed = draft.value.trim().slice(0, 256);
    if (trimmed !== getCurrentTask()) {
      onSave(trimmed);
    }
  }

  function cancel(): void {
    editing.value = false;
  }

  return { editing, draft, inputRef, startEdit, save, cancel };
}
