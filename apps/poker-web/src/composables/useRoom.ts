import { onMounted, onUnmounted } from 'vue';
import { io, type Socket } from 'socket.io-client';
import type {
  CardsRevealedPayload,
  ParticipantJoinedPayload,
  ParticipantDisconnectedPayload,
  ParticipantLeftPayload,
  CardSelectedPayload,
  RoomStatePayload,
} from '@vadim-codes/poker-contracts';
import { useSession } from './useSession';
import { useRoomStore } from '@/stores/room';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export function useRoom(roomId: string) {
  const { sessionId, name, addRoom } = useSession();
  const store = useRoomStore();

  let socket: Socket | null = null;

  function connect(): void {
    store.isConnecting = true;
    socket = io(API_URL, { transports: ['websocket'] });

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

    socket.on('cardSelected', ({ sessionId: sid }: CardSelectedPayload) => {
      store.cardSelected(sid);
    });

    socket.on('cardsRevealed', (payload: CardsRevealedPayload) => {
      store.cardsRevealed(payload);
    });

    socket.on('roundReset', () => {
      store.roundReset();
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

  onMounted(() => {
    store.clear();
    connect();
  });

  onUnmounted(() => {
    socket?.disconnect();
    socket = null;
  });

  return { store, selectCard, reveal, reset };
}
