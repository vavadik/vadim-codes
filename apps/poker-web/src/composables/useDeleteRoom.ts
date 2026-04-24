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
    try {
      const res = await roomApi.deleteRoom({
        params: { id: roomId },
        headers: { 'x-session-id': sessionId },
      });
      if (res.status === 204) {
        removeRoom(roomId);
        if (redirectHome) {
          await router.push('/');
        }
        return true;
      }
      if (res.status === 403) {
        deleteError.value = 'Not authorised to delete this room.';
      } else {
        deleteError.value = 'Failed to delete room.';
      }
      return false;
    } catch {
      deleteError.value = 'Network error.';
      return false;
    } finally {
      isDeleting.value = false;
    }
  }

  return { deleteRoom, isDeleting, deleteError };
}
