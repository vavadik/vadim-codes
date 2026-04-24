import { onMounted, onUnmounted, watch } from 'vue';
import { io, type Socket } from 'socket.io-client';
import type {
  CardsRevealedPayload,
  DeckChangedPayload,
  MasterChangedPayload,
  ParticipantJoinedPayload,
  ParticipantDisconnectedPayload,
  ParticipantReconnectedPayload,
  ParticipantLeftPayload,
  CardSelectedPayload,
  PublicModeChangedPayload,
  RoomStatePayload,
  TaskUpdatedPayload,
  TitleUpdatedPayload,
} from '@vadim-codes/poker-contracts';
import { useSession } from './useSession';
import { useRoomStore } from '@/stores/room';

const API_URL = import.meta.env.VITE_API_URL ?? window.location.origin;

export function useRoom(roomId: string) {
  const { sessionId, name, addRoom, removeRoom } = useSession();
  const store = useRoomStore();

  let socket: Socket | null = null;

  function connect(): void {
    store.isConnecting = true;
    socket = io(API_URL, { path: '/api/socket.io', transports: ['websocket'] });

    socket.on('connect', () => {
      socket!.emit('join', { roomId, sessionId, name: name.value });
    });

    socket.on('roomState', (payload: RoomStatePayload) => {
      store.isConnecting = false;
      store.setRoom(payload);
      addRoom({
        id: roomId,
        title: payload.title || roomId,
        isOwner: payload.masterSessionId === sessionId,
      });
    });

    socket.on('roomNotFound', () => {
      store.isConnecting = false;
      store.setError('Room not found.');
      removeRoom(roomId);
    });

    socket.on('masterChanged', ({ sessionId: sid }: MasterChangedPayload) => {
      store.masterChanged(sid);
    });

    socket.on('publicModeChanged', ({ enabled }: PublicModeChangedPayload) => {
      store.publicModeChanged(enabled);
    });

    socket.on('titleUpdated', ({ title }: TitleUpdatedPayload) => {
      store.titleUpdated(title);
    });

    socket.on('participantJoined', ({ participant }: ParticipantJoinedPayload) => {
      store.participantJoined(participant);
    });

    socket.on('participantLeft', ({ sessionId: sid }: ParticipantLeftPayload) => {
      store.participantLeft(sid);
    });

    socket.on('participantDisconnected', ({ sessionId: sid }: ParticipantDisconnectedPayload) => {
      store.participantDisconnected(sid);
    });

    socket.on('participantReconnected', ({ sessionId: sid }: ParticipantReconnectedPayload) => {
      store.participantReconnected(sid);
    });

    socket.on('cardSelected', ({ sessionId: sid }: CardSelectedPayload) => {
      store.cardSelected(sid);
    });

    socket.on('cardsRevealed', (payload: CardsRevealedPayload) => {
      store.cardsRevealed(payload);
    });

    socket.on('roundReset', () => {
      store.roundReset();
    });

    socket.on('taskUpdated', ({ task }: TaskUpdatedPayload) => {
      store.taskUpdated(task);
    });

    socket.on('deckChanged', (payload: DeckChangedPayload) => {
      store.deckChanged(payload);
    });

    socket.on('disconnect', () => {
      store.participantDisconnected(sessionId);
    });
  }

  function selectCard(value: string): void {
    socket?.emit('selectCard', { value });
  }

  function reveal(): void {
    socket?.emit('reveal');
  }

  function reset(): void {
    socket?.emit('reset');
  }

  function setTask(task: string): void {
    socket?.emit('setTask', { task });
  }

  function setDeck(deck: string, deckValues?: string[]): void {
    socket?.emit('setDeck', { deck, deckValues });
  }

  function transferMaster(targetSessionId: string): void {
    socket?.emit('transferMaster', { sessionId: targetSessionId });
  }

  function togglePublicMode(enabled: boolean): void {
    socket?.emit('togglePublicMode', { enabled });
  }

  function setTitle(title: string): void {
    socket?.emit('setTitle', { title });
  }

  onMounted(() => {
    store.clear();
    if (name.value) {
      connect();
    } else {
      const stop = watch(name, (val) => {
        if (val) {
          stop();
          connect();
        }
      });
    }
  });

  onUnmounted(() => {
    socket?.disconnect();
    socket = null;
  });

  return {
    store,
    selectCard,
    reveal,
    reset,
    setTask,
    setDeck,
    transferMaster,
    togglePublicMode,
    setTitle,
  };
}
