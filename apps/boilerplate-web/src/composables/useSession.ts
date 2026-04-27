import { computed, ref } from 'vue';

const SESSION_KEY = 'boilerplate:sessionId';
const NAME_KEY = 'boilerplate:name';

function initSessionId(): string {
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) {
    return existing;
  }
  const id = crypto.randomUUID();
  localStorage.setItem(SESSION_KEY, id);
  return id;
}

const sessionId = initSessionId();
const name = ref<string>(localStorage.getItem(NAME_KEY) ?? '');

function setName(value: string): void {
  name.value = value;
  localStorage.setItem(NAME_KEY, value);
}

export function useSession() {
  return {
    sessionId,
    name: computed(() => name.value),
    setName,
  };
}
