'use client';

import { useEffect, useRef } from 'react';
import { Bold, Underline as UnderlineIcon, Eraser } from 'lucide-react';

const COLORS = [
  { label: 'Red / 红', value: '#dc2626' },
  { label: 'Orange / 橙', value: '#ea580c' },
  { label: 'Green / 绿', value: '#16a34a' },
  { label: 'Blue / 蓝', value: '#2563eb' },
];

// Simple contentEditable-based rich text editor: bold / underline / text color, applied via
// document.execCommand (still universally supported by browsers for basic formatting like
// this, despite being spec-deprecated). Uncontrolled by design - the parent should remount
// this component (via a `key` prop) when switching to a different article, rather than
// trying to keep `value` in sync on every keystroke, which would fight the browser's own
// cursor/selection state.
export default function RichTextEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value || '';
    }
    try {
      document.execCommand('defaultParagraphSeparator', false, 'br');
    } catch (e) {
      // Some browsers may not support this command; formatting still works, just with a
      // different default paragraph structure on Enter.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emitChange = () => {
    onChange(editorRef.current?.innerHTML || '');
  };

  const applyFormat = (command, arg) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    emitChange();
  };

  return (
    <div className="rounded-xl border border-border/50 bg-background/50 overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border/50 bg-card/40">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyFormat('bold')}
          className="p-1.5 rounded hover:bg-glow-cyan/10 text-muted-foreground hover:text-glow-cyan transition-colors"
          title="加粗 Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyFormat('underline')}
          className="p-1.5 rounded hover:bg-glow-cyan/10 text-muted-foreground hover:text-glow-cyan transition-colors"
          title="下划线 Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-border/50 mx-1" />

        {COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyFormat('foreColor', color.value)}
            className="w-6 h-6 rounded-full border border-border/50 hover:scale-110 transition-transform"
            style={{ backgroundColor: color.value }}
            title={color.label}
          />
        ))}

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyFormat('removeFormat')}
          className="p-1.5 rounded hover:bg-red-400/10 text-muted-foreground hover:text-red-400 transition-colors ml-1"
          title="清除格式 Clear formatting"
        >
          <Eraser className="w-4 h-4" />
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={emitChange}
        data-placeholder={placeholder}
        className="min-h-[180px] max-h-[420px] overflow-y-auto px-4 py-3 text-foreground text-sm leading-relaxed focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50"
      />
    </div>
  );
}
