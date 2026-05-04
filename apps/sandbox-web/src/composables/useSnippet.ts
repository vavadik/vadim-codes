import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { apiClient } from './useApiClient';
import { useToast } from './useToast';

export const isSaving = ref(false);

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function useSnippet() {
  const router = useRouter();
  const { show } = useToast();

  async function saveSnippet(code: string): Promise<void> {
    if (isSaving.value) {
      return;
    }

    if (saveTimer !== null) {
      clearTimeout(saveTimer);
    }

    saveTimer = setTimeout(async () => {
      isSaving.value = true;
      try {
        const res = await apiClient.snippets.create({ body: { code } });
        if (res.status === 201) {
          const { id, url } = res.body;
          await router.push(`/s/${id}`);
          const shareUrl = `${window.location.origin}${url}`;
          try {
            await navigator.clipboard.writeText(shareUrl);
            show('Link copied!', 'success');
          } catch {
            show(`Saved! Link: ${shareUrl}`, 'info', 6000);
          }
        } else {
          show('Failed to save snippet. Try again.', 'error');
        }
      } catch {
        show('Failed to save snippet. Check your connection.', 'error');
      } finally {
        isSaving.value = false;
      }
    }, 300);
  }

  async function loadSnippet(id: string): Promise<{ code: string } | null> {
    const res = await apiClient.snippets.getById({ params: { id } });
    if (res.status === 200) {
      return { code: res.body.code };
    }
    return null;
  }

  return { saveSnippet, loadSnippet, isSaving };
}
