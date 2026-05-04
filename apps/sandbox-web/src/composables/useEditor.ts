import loader from '@monaco-editor/loader';
import type * as Monaco from 'monaco-editor';
import { onUnmounted, shallowRef, ref, watch } from 'vue';
import { useTheme } from './useTheme';
import { useEditorPrefs } from './useEditorPrefs';

export type IMarkerData = Monaco.editor.IMarkerData;

const DRAFT_KEY = 'sandbox:draft';
const DEFAULT_CODE = 'console.log("Hello, world!")';

const { theme } = useTheme();
const { fontSize, tabSize } = useEditorPrefs();

export const editor = shallowRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
export const value = ref('');
export const draftSaved = ref(false);

let monacoInstance: typeof Monaco | null = null;
let draftSaveTimer: ReturnType<typeof setTimeout> | null = null;
let draftSavedTimer: ReturnType<typeof setTimeout> | null = null;

watch(fontSize, (size) => editor.value?.updateOptions({ fontSize: size }));
watch(tabSize, (size) => editor.value?.updateOptions({ tabSize: size }));

export function useEditor() {
  async function mount(container: HTMLElement): Promise<void> {
    const monaco = await loader.init();
    monacoInstance = monaco;

    const editorTheme = theme.value === 'dark' ? 'vs-dark' : 'vs';
    const initialValue = localStorage.getItem(DRAFT_KEY) ?? DEFAULT_CODE;
    value.value = initialValue;

    const instance = monaco.editor.create(container, {
      value: initialValue,
      language: 'javascript',
      theme: editorTheme,
      lineNumbers: 'on',
      matchBrackets: 'always',
      autoIndent: 'full',
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: fontSize.value,
      tabSize: tabSize.value,
    });

    editor.value = instance;

    instance.onDidChangeModelContent(() => {
      value.value = instance.getValue();

      if (draftSaveTimer !== null) {
        clearTimeout(draftSaveTimer);
      }
      draftSaveTimer = setTimeout(() => {
        localStorage.setItem(DRAFT_KEY, instance.getValue());
        draftSaved.value = true;
        if (draftSavedTimer !== null) {
          clearTimeout(draftSavedTimer);
        }
        draftSavedTimer = setTimeout(() => {
          draftSaved.value = false;
        }, 2000);
      }, 1000);
    });
  }

  function setValue(code: string): void {
    value.value = code;
    editor.value?.setValue(code);
  }

  function setMarkers(markers: Monaco.editor.IMarkerData[]): void {
    if (!monacoInstance || !editor.value) {
      return;
    }
    const model = editor.value.getModel();
    if (model) {
      monacoInstance.editor.setModelMarkers(model, 'sandbox', markers);
    }
  }

  function updateTheme(t: 'dark' | 'light'): void {
    monacoInstance?.editor.setTheme(t === 'dark' ? 'vs-dark' : 'vs');
  }

  onUnmounted(() => {
    editor.value?.dispose();
    editor.value = null;
    if (draftSaveTimer !== null) {
      clearTimeout(draftSaveTimer);
    }
    if (draftSavedTimer !== null) {
      clearTimeout(draftSavedTimer);
    }
  });

  return { value, setValue, setMarkers, editor, mount, updateTheme, draftSaved };
}
