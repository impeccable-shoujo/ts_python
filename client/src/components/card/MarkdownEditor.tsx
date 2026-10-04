import type { ReactElement } from 'react';
import MDEditor from '@uiw/react-md-editor';
import styles from './MarkdownEditor.module.css';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: number;
  placeholder?: string;
}

// Markdown 编辑器封装：受控 value/onChange，预览由组件内置渲染（禁止手工 innerHTML）。
function MarkdownEditor({ value, onChange, height = 240, placeholder }: MarkdownEditorProps): ReactElement {
  return (
    <div className={styles.wrap} data-color-mode="light">
      <MDEditor
        value={value}
        height={height}
        onChange={(next) => onChange(next ?? '')}
        textareaProps={{ placeholder }}
      />
    </div>
  );
}

export default MarkdownEditor;
