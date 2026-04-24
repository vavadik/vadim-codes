import { defineStore } from 'pinia';
import { ref } from 'vue';
import type {
  CardsRevealedPayload,
  DeckChangedPayload,
  ParticipantPayload,
  RoomStatePayload,
} from '@vadim-codes/poker-contracts';

export const useRoomStore = defineStore('room', () => {
  const room = ref<RoomStatePayload | null>(null);
  const error = ref<string | null>(null);
  const isConnecting = ref(false);

  function setRoom(payload: RoomStatePayload): void {
    room.value = payload;
    error.value = null;
  }

  function setError(msg: string): void {
    error.value = msg;
  }

  function participantJoined(participant: ParticipantPayload): void {
    if (!room.value) {
      return;
    }
    const exists = room.value.participants.some((p) => p.sessionId === participant.sessionId);
    if (!exists) {
      room.value.participants.push(participant);
    }
  }

  function participantLeft(sessionId: string): void {
    if (!room.value) {
      return;
    }
    room.value.participants = room.value.participants.filter((p) => p.sessionId !== sessionId);
  }

  function participantDisconnected(sessionId: string): void {
    if (!room.value) {
      return;
    }
    const p = room.value.participants.find((p) => p.sessionId === sessionId);
    if (p) {
      p.isConnected = false;
    }
  }

  function participantReconnected(sessionId: string): void {
    if (!room.value) {
      return;
    }
    const p = room.value.participants.find((p) => p.sessionId === sessionId);
    if (p) {
      p.isConnected = true;
    }
  }

  function cardSelected(sessionId: string): void {
    if (!room.value) {
      return;
    }
    const p = room.value.participants.find((p) => p.sessionId === sessionId);
    if (p) {
      p.hasVoted = true;
    }
  }

  function cardsRevealed(payload: CardsRevealedPayload): void {
    if (!room.value) {
      return;
    }
    room.value.state = 'revealed';
    room.value.votes = payload.votes;
    for (const p of room.value.participants) {
      p.hasVoted = p.sessionId in payload.votes;
    }
  }

  function taskUpdated(task: string): void {
    if (!room.value) {
      return;
    }
    room.value.currentTask = task;
  }

  function deckChanged(payload: DeckChangedPayload): void {
    if (!room.value) {
      return;
    }
    room.value.deck = payload.deck;
    room.value.deckValues = payload.deckValues;
    room.value.state = 'voting';
    room.value.votes = null;
    for (const p of room.value.participants) {
      p.hasVoted = false;
    }
  }

  function roundReset(): void {
    if (!room.value) {
      return;
    }
    room.value.state = 'voting';
    room.value.votes = null;
    for (const p of room.value.participants) {
      p.hasVoted = false;
    }
  }

  function masterChanged(sessionId: string): void {
    if (!room.value) {
      return;
    }
    room.value.masterSessionId = sessionId;
  }

  function publicModeChanged(enabled: boolean): void {
    if (!room.value) {
      return;
    }
    room.value.isPublicMode = enabled;
  }

  function titleUpdated(title: string): void {
    if (!room.value) {
      return;
    }
    room.value.title = title;
  }

  function clear(): void {
    room.value = null;
    error.value = null;
    isConnecting.value = false;
  }

  return {
    room,
    error,
    isConnecting,
    setRoom,
    setError,
    participantJoined,
    participantLeft,
    participantDisconnected,
    participantReconnected,
    cardSelected,
    cardsRevealed,
    taskUpdated,
    deckChanged,
    roundReset,
    masterChanged,
    publicModeChanged,
    titleUpdated,
    clear,
  };
});
