import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { roomApi } from '@/api/roomApi';
import { useSession } from './useSession';

export function useDeleteRoom() {
  const { sessionId, removeRoom } = useSession();
  const router = useRouter();
  const isDeleting = ref(false);
  const deleteError = ref('');

  async function deleteRoom(roomId: string, redirectHome = false): Promise<boolean> {
    isDeleting.value = true;
    deleteError.value = '';
    let success = true;
    try {
      const res = await roomApi.deleteRoom({
        params: { id: roomId },
        headers: { 'x-session-id': sessionId },
      });
      if (res.status === 403) {
        deleteError.value = 'Not authorised to delete this room.';
        success = false;
      } else if (res.status !== 204 && res.status !== 404) {
        deleteError.value = 'Failed to delete room.';
        success = false;
      }
    } catch {
      deleteError.value = 'Network error.';
      success = false;
    } finally {
      isDeleting.value = false;
    }
    removeRoom(roomId);
    if (redirectHome) {
      await router.push('/');
    }
    return success;
  }

  return { deleteRoom, isDeleting, deleteError };
}
