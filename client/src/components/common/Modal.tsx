import type { ReactElement, ReactNode } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

// 通用弹窗：开关受控（open/onClose 由父级控制），点击遮罩关闭。
function Modal({ open, onClose, title, children }: ModalProps): ReactElement | null {
  if (!open) return null;
  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          {title && <span className={styles.title}>{title}</span>}
          <button type="button" className={styles.close} onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}

export default Modal;
