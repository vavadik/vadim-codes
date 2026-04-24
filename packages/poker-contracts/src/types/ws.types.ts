import type { DeckName, RoomState } from './room.types';

// Serialisable participant (no Map, sent over the wire)
export interface ParticipantPayload {
  sessionId: string;
  name: string;
  hasVoted: boolean;
  isConnected: boolean;
}

// Full room snapshot sent in response to 'join' and after reconnect
export interface RoomStatePayload {
  id: string;
  title: string;
  currentTask: string;
  deck: DeckName;
  deckValues: string[];
  isPublicMode: boolean;
  masterSessionId: string | null;
  state: RoomState;
  participants: ParticipantPayload[];
  votes: Record<string, string | null> | null; // populated only when state = 'revealed'
}

// ── Client → Server events ──────────────────────────────────────────────────

export interface JoinPayload {
  roomId: string;
  sessionId: string;
  name: string;
}

export interface SelectCardPayload {
  value: string;
}

// ── Server → Client events ──────────────────────────────────────────────────

export interface ParticipantJoinedPayload {
  participant: ParticipantPayload;
}

export interface ParticipantLeftPayload {
  sessionId: string;
}

export interface ParticipantDisconnectedPayload {
  sessionId: string;
}

export interface ParticipantReconnectedPayload {
  sessionId: string;
}

export interface CardSelectedPayload {
  sessionId: string;
}

export interface CardsRevealedPayload {
  votes: Record<string, string | null>;
}

// ── PS-08: Set current task ──────────────────────────────────────────────────

export interface SetTaskPayload {
  task: string;
}

export interface TaskUpdatedPayload {
  task: string;
}

// ── PS-10: Deck selection ────────────────────────────────────────────────────

export interface SetDeckPayload {
  deck: DeckName;
  deckValues?: string[]; // required when deck === 'custom'
}

export interface DeckChangedPayload {
  deck: DeckName;
  deckValues: string[];
}

// ── PS-11: Transfer master ───────────────────────────────────────────────────

export interface TransferMasterPayload {
  sessionId: string;
}

export interface MasterChangedPayload {
  sessionId: string;
}

// ── PS-12: Public mode ───────────────────────────────────────────────────────

export interface TogglePublicModePayload {
  enabled: boolean;
}

export interface PublicModeChangedPayload {
  enabled: boolean;
}

// ── PS-13: Room title ────────────────────────────────────────────────────────

export interface SetTitlePayload {
  title: string;
}

export interface TitleUpdatedPayload {
  title: string;
}
