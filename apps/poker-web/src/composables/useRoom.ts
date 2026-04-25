import { onMounted, onUnmounted, ref, watch } from 'vue';
import { io, type Socket } from 'socket.io-client';
import type {
  CardsRevealedPayload,
  DeckChangedPayload,
  MasterChangedPayload,
  ParticipantJoinedPayload,
  ParticipantDisconnectedPayload,
  ParticipantRenamedPayload,
  ParticipantReconnectedPayload,
  ParticipantLeftPayload,
  CardSelectedPayload,
  PublicModeChangedPayload,
  ReactionPayload,
  RoomStatePayload,
  TaskUpdatedPayload,
  TitleUpdatedPayload,
} from '@vadim-codes/poker-contracts';
import { useSession } from './useSession';
import { useRoomStore } from '@/stores/room';

export interface ActiveReaction {
  id: number;
  emoji: string;
}

const API_URL = import.meta.env.VITE_API_URL ?? window.location.origin;

export function useRoom(roomId: string) {
  const { sessionId, name, addRoom, removeRoom } = useSession();
  const store = useRoomStore();

  let socket: Socket | null = null;
  const reactions = ref<Record<string, ActiveReaction[]>>({});
  let reactionIdCounter = 0;

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

    socket.on('cardUnselected', ({ sessionId: sid }: CardSelectedPayload) => {
      store.cardUnselected(sid);
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

    socket.on('reaction', ({ sessionId: sid, emoji }: ReactionPayload) => {
      const id = ++reactionIdCounter;
      reactions.value = {
        ...reactions.value,
        [sid]: [...(reactions.value[sid] ?? []), { id, emoji }],
      };
      setTimeout(() => {
        reactions.value = {
          ...reactions.value,
          [sid]: (reactions.value[sid] ?? []).filter((r) => r.id !== id),
        };
      }, 2500);
    });

    socket.on(
      'participantRenamed',
      ({ sessionId: sid, name: newName }: ParticipantRenamedPayload) => {
        store.participantRenamed(sid, newName);
      }
    );

    socket.on('disconnect', () => {
      store.participantDisconnected(sessionId);
    });

    let hasJoined = false;
    socket.on('connect', () => {
      hasJoined = true;
    });
    watch(name, (newName) => {
      if (newName && hasJoined && socket?.connected) {
        socket.emit('renameSelf', { name: newName });
      }
    });
  }

  function selectCard(value: string): void {
    socket?.emit('selectCard', { value });
  }

  function unselectCard(): void {
    socket?.emit('unselectCard');
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

  function kickParticipant(targetSessionId: string): void {
    socket?.emit('kickParticipant', { sessionId: targetSessionId });
  }

  function sendReaction(emoji: string): void {
    socket?.emit('sendReaction', { emoji });
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

  function renameSelf(newName: string): void {
    socket?.emit('renameSelf', { name: newName });
  }

  return {
    store,
    reactions,
    selectCard,
    unselectCard,
    reveal,
    reset,
    setTask,
    setDeck,
    transferMaster,
    togglePublicMode,
    setTitle,
    kickParticipant,
    renameSelf,
    sendReaction,
  };
}
