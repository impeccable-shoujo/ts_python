import type { ReactElement, KeyboardEvent } from 'react';
import type { Card } from '../../types/card.type';
import { toPlainText } from '../../utils/cardText';
import styles from './CardFlip.module.css';

interface CardFlipProps {
  card: Card;
  flipped: boolean;
  onFlip: () => void;
}

// 卡片翻面：3D 翻转（纯 CSS transform，与全项目 CSS Module 方案一致）；翻转受控于 flipped/onFlip。
function CardFlip({ card, flipped, onFlip }: CardFlipProps): ReactElement {
  const frontText = toPlainText(card.front);
  const backText = toPlainText(card.back);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onFlip();
    }
  };

  return (
    <div
      className={styles.scene}
      onClick={onFlip}
      role="button"
      tabIndex={0}
      aria-label="点击翻转卡片"
      onKeyDown={handleKeyDown}
    >
      <div className={flipped ? `${styles.card} ${styles.flipped}` : styles.card}>
        <div className={styles.face}>
          <span className={styles.faceLabel}>问题</span>
          <p className={styles.faceText}>{frontText}</p>
        </div>
        <div className={`${styles.face} ${styles.back}`}>
          <span className={styles.faceLabel}>答案</span>
          <p className={styles.faceText}>{backText}</p>
        </div>
      </div>
    </div>
  );
}

export default CardFlip;
