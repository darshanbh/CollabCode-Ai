import Editor from '@monaco-editor/react';
import { useRef } from 'react';

function CodeEditor({ code, language, onChange, isExamMode = false, onKeystrokeEvent }) {
  const editorRef = useRef(null);

  const handleMount = (editor) => {
    editorRef.current = editor;

    // Track paste events
    editor.onDidPaste((e) => {
      const pastedText = editor.getModel().getValueInRange(e.range);
      if (onKeystrokeEvent) {
        onKeystrokeEvent({
          type: 'paste',
          length: pastedText.length,
          timestamp: Date.now()
        });
      }
    });

    // Track keystrokes
    editor.onKeyDown((e) => {
      if (onKeystrokeEvent) {
        onKeystrokeEvent({
          type: 'keystroke',
          key: e.code,
          timestamp: Date.now()
        });
      }
    });
  };

  return (
    <Editor
      height="100%"
      language={language}
      value={code}
      onChange={(value) => onChange(value || '')}
      theme="vs-dark"
      onMount={handleMount}
      options={{
        fontSize: 15,
        minimap: { enabled: false },
        wordWrap: 'on',
        automaticLayout: true,
        scrollBeyondLastLine: false,
        padding: { top: 16 }
      }}
    />
  );
}

export default CodeEditor;