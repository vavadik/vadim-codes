export type DeckName = 'fibonacci' | 'tshirt' | 'powersOfTwo' | 'custom';

export type RoomState = 'voting' | 'revealed';

export interface Participant {
  sessionId: string;
  socketId: string;
  name: string;
  selectedCard: string | null;
}

export interface Room {
  id: string;
  title: string;
  currentTask: string;
  deck: DeckName;
  deckValues: string[];
  isPublicMode: boolean;
  masterSessionId: string | null;
  state: RoomState;
  participants: Map<string, Participant>;
  lastActivityAt: Date;
}
