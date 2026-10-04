import type { ReactElement } from 'react';
import type { Card } from '../../types/card.type';
import type { Tag } from '../../types/tag.type';
import { toPlainText, truncate, formatDate } from '../../utils/cardText';
import EmptyState from '../common/EmptyState';
import styles from './CardGrid.module.css';

interface CardGridProps {
  cards: Card[];
  tags: Tag[];
  loading?: boolean;
  onEdit: (card: Card) => void;
  onDelete: (card: Card) => void;
}

// 卡片网格：空数据渲染 EmptyState；否则展示 front 纯文本摘要、标签、下次复习时间。
function CardGrid({ cards, tags, loading, onEdit, onDelete }: CardGridProps): ReactElement {
  if (cards.length === 0) {
    return loading ? (
      <div className={styles.hint}>加载中…</div>
    ) : (
      <EmptyState message="还没有卡片，点击「新建卡片」开始吧" />
    );
  }

  const tagMap = new Map(tags.map((t) => [t.id, t]));

  return (
    <div className={styles.grid}>
      {cards.map((card) => (
        <div key={card.id} className={styles.card}>
          <div className={styles.front}>{truncate(toPlainText(card.front), 120)}</div>
          <div className={styles.tags}>
            {card.tagIds.map((id) => {
              const tag = tagMap.get(id);
              if (!tag) return null;
              return (
                <span
                  key={id}
                  className={styles.tag}
                  style={{ backgroundColor: tag.color, color: '#fff' }}
                >
                  {tag.name}
                </span>
              );
            })}
          </div>
          <div className={styles.meta}>下次复习：{formatDate(card.nextReviewAt)}</div>
          <div className={styles.actions}>
            <button type="button" className={styles.editBtn} onClick={() => onEdit(card)}>
              编辑
            </button>
            <button type="button" className={styles.delBtn} onClick={() => onDelete(card)}>
              删除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CardGrid;
