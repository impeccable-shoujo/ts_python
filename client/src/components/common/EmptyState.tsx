import type { ReactElement, ReactNode } from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  message: string;
  action?: ReactNode;
}

// 通用空数据占位：展示提示文案，可选操作区（如"去添加"按钮）。
function EmptyState({ message, action }: EmptyStateProps): ReactElement {
  return (
    <div className={styles.wrap}>
      <p className={styles.message}>{message}</p>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

export default EmptyState;
