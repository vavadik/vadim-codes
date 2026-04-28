import loader from '@monaco-editor/loader';
import type * as Monaco from 'monaco-editor';
import { onUnmounted, shallowRef, ref } from 'vue';
import { useTheme } from './useTheme';

export type IMarkerData = Monaco.editor.IMarkerData;

const { theme } = useTheme();

export function useEditor() {
  const editor = shallowRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const value = ref('');
  let monacoInstance: typeof Monaco | null = null;

  async function mount(container: HTMLElement): Promise<void> {
    const monaco = await loader.init();
    monacoInstance = monaco;

    const editorTheme = theme.value === 'dark' ? 'vs-dark' : 'vs';

    const instance = monaco.editor.create(container, {
      value: value.value,
      language: 'javascript',
      theme: editorTheme,
      lineNumbers: 'on',
      matchBrackets: 'always',
      autoIndent: 'full',
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
    });

    editor.value = instance;

    instance.onDidChangeModelContent(() => {
      value.value = instance.getValue();
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
  });

  return { value, setValue, setMarkers, editor, mount, updateTheme };
}
