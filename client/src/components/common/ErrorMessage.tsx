import type { ReactElement } from 'react';
import styles from './ErrorMessage.module.css';

interface ErrorMessageProps {
  message: string | null;
}

// 通用错误条：仅当 message 存在时渲染。
function ErrorMessage({ message }: ErrorMessageProps): ReactElement | null {
  if (!message) return null;
  return (
    <div className={styles.bar} role="alert">
      {message}
    </div>
  );
}

export default ErrorMessage;
