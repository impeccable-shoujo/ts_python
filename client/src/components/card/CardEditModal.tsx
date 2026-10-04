import { useEffect, useState, type ReactElement } from 'react';
import type { Card, CardCreateDTO } from '../../types/card.type';
import type { Tag } from '../../types/tag.type';
import Modal from '../common/Modal';
import Button from '../common/Button';
import MarkdownEditor from './MarkdownEditor';
import styles from './CardEditModal.module.css';

interface CardEditModalProps {
  open: boolean;
  onClose: () => void;
  card: Card | null; // null = 新建
  tags: Tag[];
  loading?: boolean;
  onSubmit: (values: CardCreateDTO) => void;
}

// 新建/编辑卡片弹窗：用 MarkdownEditor 编辑 front/back，标签多选。
function CardEditModal({ open, onClose, card, tags, loading, onSubmit }: CardEditModalProps): ReactElement {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<number>>(new Set());

  // 打开时根据 card 初始化表单（card 为 null 即新建，留空）。
  useEffect(() => {
    if (!open) return;
    setFront(card?.front ?? '');
    setBack(card?.back ?? '');
    setSelectedTags(new Set(card?.tagIds ?? []));
  }, [open, card]);

  const toggleTag = (id: number): void => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canSave = front.trim().length > 0 && back.trim().length > 0;

  const handleSave = (): void => {
    if (!canSave) return;
    onSubmit({ front: front.trim(), back: back.trim(), tagIds: Array.from(selectedTags) });
  };

  return (
    <Modal open={open} onClose={onClose} title={card ? '编辑卡片' : '新建卡片'}>
      <div className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>正面（front / 问题）</label>
          <MarkdownEditor value={front} onChange={setFront} placeholder="支持 Markdown" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>背面（back / 答案）</label>
          <MarkdownEditor value={back} onChange={setBack} placeholder="支持 Markdown" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>标签</label>
          <div className={styles.tagList}>
            {tags.length === 0 && <span className={styles.tagEmpty}>暂无标签，请先到「标签」页创建</span>}
            {tags.map((t) => {
              const active = selectedTags.has(t.id);
              return (
                <button
                  type="button"
                  key={t.id}
                  className={styles.tagChip}
                  style={
                    active
                      ? { backgroundColor: t.color, color: '#fff', borderColor: t.color }
                      : undefined
                  }
                  onClick={() => toggleTag(t.id)}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>
        <div className={styles.footer}>
          <Button onClick={onClose}>取消</Button>
          <Button onClick={handleSave} loading={loading} disabled={!canSave}>
            保存
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default CardEditModal;
