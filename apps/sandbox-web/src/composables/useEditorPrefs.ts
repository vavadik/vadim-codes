import { ref, watch } from 'vue';

const PREFS_KEY = 'sandbox:editorPrefs';

export interface EditorPrefs {
  fontSize: number;
  tabSize: 2 | 4;
}

function loadPrefs(): EditorPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<EditorPrefs>;
      return {
        fontSize:
          typeof parsed.fontSize === 'number' ? Math.min(24, Math.max(10, parsed.fontSize)) : 14,
        tabSize: parsed.tabSize === 4 ? 4 : 2,
      };
    }
  } catch {}
  return { fontSize: 14, tabSize: 2 };
}

const prefs = loadPrefs();
const fontSize = ref(prefs.fontSize);
const tabSize = ref<2 | 4>(prefs.tabSize);

watch([fontSize, tabSize], () => {
  localStorage.setItem(
    PREFS_KEY,
    JSON.stringify({ fontSize: fontSize.value, tabSize: tabSize.value })
  );
});

export function useEditorPrefs() {
  return { fontSize, tabSize };
}
