import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: ReactNode;
}

// 通用按钮：受控 loading/disabled，loading 时禁用并显示处理中态。
function Button({
  loading = false,
  disabled,
  children,
  className,
  type = 'button',
  ...rest
}: ButtonProps): ReactElement {
  const classNames = [styles.button, className].filter(Boolean).join(' ');
  return (
    <button type={type} className={classNames} disabled={disabled || loading} {...rest}>
      {loading ? '处理中…' : children}
    </button>
  );
}

export default Button;
