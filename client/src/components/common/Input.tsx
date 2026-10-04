import { useId } from 'react';
import type { InputHTMLAttributes, ReactElement } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

// 通用输入框：label + 错误提示；受控（value/onChange 由父级通过 ...rest 传入）。
function Input({ label, error, id, className, ...rest }: InputProps): ReactElement {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const classNames = [styles.input, className].filter(Boolean).join(' ');
  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <input
        id={inputId}
        className={classNames}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}

export default Input;
