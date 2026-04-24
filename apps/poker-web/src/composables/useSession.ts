import { computed, ref } from 'vue';

export interface RoomRecord {
  id: string;
  title: string;
  isOwner: boolean;
  lastVisited: string;
}

const SESSION_KEY = 'poker:sessionId';
const NAME_KEY = 'poker:name';
const ROOMS_KEY = 'poker:rooms';
const MAX_ROOMS = 20;

function initSessionId(): string {
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) {
    return existing;
  }
  const id = crypto.randomUUID();
  localStorage.setItem(SESSION_KEY, id);
  return id;
}

function loadRooms(): RoomRecord[] {
  try {
    return JSON.parse(localStorage.getItem(ROOMS_KEY) ?? '[]') as RoomRecord[];
  } catch {
    return [];
  }
}

const sessionId = initSessionId();
const name = ref<string>(localStorage.getItem(NAME_KEY) ?? '');
const rooms = ref<RoomRecord[]>(loadRooms());

function setName(value: string): void {
  name.value = value;
  localStorage.setItem(NAME_KEY, value);
}

function addRoom(entry: Omit<RoomRecord, 'lastVisited'>): void {
  const now = new Date().toISOString();
  const idx = rooms.value.findIndex((r) => r.id === entry.id);
  if (idx !== -1) {
    rooms.value[idx] = { ...rooms.value[idx], ...entry, lastVisited: now };
  } else {
    rooms.value.push({ ...entry, lastVisited: now });
  }
  rooms.value.sort((a, b) => b.lastVisited.localeCompare(a.lastVisited));
  if (rooms.value.length > MAX_ROOMS) {
    rooms.value = rooms.value.slice(0, MAX_ROOMS);
  }
  localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms.value));
}

function removeRoom(id: string): void {
  rooms.value = rooms.value.filter((r) => r.id !== id);
  localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms.value));
}

export function useSession() {
  return {
    sessionId,
    name: computed(() => name.value),
    setName,
    rooms: computed(() => rooms.value),
    addRoom,
    removeRoom,
  };
}
