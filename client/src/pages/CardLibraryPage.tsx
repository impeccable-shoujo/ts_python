import { useEffect, useState, type ChangeEvent, type ReactElement } from 'react';
import { useCardStore } from '../store/cardStore';
import { useTagStore } from '../store/tagStore';
import type { Card, CardCreateDTO } from '../types/card.type';
import CardGrid from '../components/card/CardGrid';
import CardEditModal from '../components/card/CardEditModal';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { toPlainText, truncate } from '../utils/cardText';
import styles from './CardLibraryPage.module.css';

// 卡片库页面：列表（分页+筛选）、新建/编辑、AI 生成草稿、删除。所有数据操作经 store，不直接调 service。
function CardLibraryPage(): ReactElement {
  const cards = useCardStore((s) => s.cards);
  const total = useCardStore((s) => s.total);
  const query = useCardStore((s) => s.query);
  const loading = useCardStore((s) => s.loading);
  const error = useCardStore((s) => s.error);
  const drafts = useCardStore((s) => s.drafts);
  const fetchCards = useCardStore((s) => s.fetchCards);
  const createCard = useCardStore((s) => s.createCard);
  const updateCard = useCardStore((s) => s.updateCard);
  const removeCard = useCardStore((s) => s.removeCard);
  const generateDrafts = useCardStore((s) => s.generateDrafts);
  const confirmDrafts = useCardStore((s) => s.confirmDrafts);

  const tags = useTagStore((s) => s.tags);
  const fetchTags = useTagStore((s) => s.fetchTags);

  const [keywordInput, setKeywordInput] = useState(query.keyword ?? '');
  const [tagFilter, setTagFilter] = useState<number | undefined>(query.tagId);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Card | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Card | null>(null);
  const [aiText, setAiText] = useState('');
  const [aiCount, setAiCount] = useState<number>(5);
  const [selectedDrafts, setSelectedDrafts] = useState<Set<number>>(new Set());

  // 进入页面拉取列表与标签。
  useEffect(() => {
    void fetchCards();
  }, [fetchCards]);
  useEffect(() => {
    void fetchTags();
  }, [fetchTags]);

  // 新生成草稿后默认全选。
  useEffect(() => {
    setSelectedDrafts(new Set(drafts.map((_, i) => i)));
  }, [drafts]);

  // 更新筛选条件并触发列表刷新（改动即触发 fetchCards）。
  const applyQuery = (
    patch: Partial<{ page: number; size: number; keyword: string; tagId: number }>,
  ): void => {
    useCardStore.setState((s) => ({ query: { ...s.query, ...patch } }));
    void useCardStore.getState().fetchCards();
  };

  const handleKeywordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const kw = e.target.value;
    setKeywordInput(kw);
    applyQuery({ keyword: kw, page: 1 });
  };

  const handleTagFilterChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    const v = e.target.value ? Number(e.target.value) : undefined;
    setTagFilter(v);
    applyQuery({ tagId: v, page: 1 });
  };

  const currentPage = query.page ?? 1;
  const pageSize = query.size ?? 20;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const openCreate = (): void => {
    setEditTarget(null);
    setModalOpen(true);
  };
  const openEdit = (card: Card): void => {
    setEditTarget(card);
    setModalOpen(true);
  };
  const closeModal = (): void => {
    setModalOpen(false);
    setEditTarget(null);
  };

  // 提交新建/编辑：成功（无 error）才关闭弹窗，失败保留弹窗并显示 error。
  const handleSubmitCard = async (values: CardCreateDTO): Promise<void> => {
    useCardStore.setState({ error: null });
    if (editTarget) {
      await updateCard(editTarget.id, values);
    } else {
      await createCard(values);
    }
    if (!useCardStore.getState().error) closeModal();
  };

  const handleGenerate = async (): Promise<void> => {
    await generateDrafts(aiText, aiCount || undefined);
  };

  const toggleDraft = (i: number): void => {
    setSelectedDrafts((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  // 逐条勾选生效：仅保留勾选草稿，再走 store.confirmDrafts（状态层按整份 drafts 入库）。
  const handleConfirmDrafts = async (): Promise<void> => {
    const selected = drafts.filter((_, i) => selectedDrafts.has(i));
    if (selected.length === 0) return;
    useCardStore.setState({ drafts: selected, error: null });
    await confirmDrafts();
    setSelectedDrafts(new Set());
  };

  // 错误重试：有 AI 上下文则重生成草稿，否则重拉列表（不阻塞其他功能）。
  const handleRetry = (): void => {
    if (aiText.trim() || drafts.length > 0) {
      void generateDrafts(aiText, aiCount || undefined);
    } else {
      void fetchCards();
    }
  };

  const openDelete = (card: Card): void => {
    setDeleteTarget(card);
  };
  const closeDelete = (): void => {
    setDeleteTarget(null);
  };
  const handleConfirmDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    useCardStore.setState({ error: null });
    await removeCard(deleteTarget.id);
    if (!useCardStore.getState().error) closeDelete();
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>卡片库</h2>
        <Button onClick={openCreate}>新建卡片</Button>
      </div>

      {error && (
        <div className={styles.errorBar} role="alert">
          <span className={styles.errorMsg}>{error}</span>
          <Button onClick={handleRetry}>重试</Button>
        </div>
      )}

      <div className={styles.toolbar}>
        <Input
          label="关键词"
          value={keywordInput}
          onChange={handleKeywordChange}
          placeholder="搜索正面/背面"
        />
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>标签</label>
          <select className={styles.select} value={tagFilter ?? ''} onChange={handleTagFilterChange}>
            <option value="">全部</option>
            {tags.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.pager}>
          <Button
            onClick={() => applyQuery({ page: Math.max(1, currentPage - 1) })}
            disabled={currentPage <= 1}
          >
            上一页
          </Button>
          <span className={styles.pageInfo}>
            第 {currentPage} / {totalPages} 页 · 共 {total} 张
          </span>
          <Button
            onClick={() => applyQuery({ page: currentPage + 1 })}
            disabled={currentPage >= totalPages}
          >
            下一页
          </Button>
        </div>
      </div>

      <div className={styles.aiPanel}>
        <h3 className={styles.sectionTitle}>AI 生成草稿</h3>
        <textarea
          className={styles.textarea}
          value={aiText}
          onChange={(e) => setAiText(e.target.value)}
          placeholder="粘贴一段文本，让 AI 拆成问答卡片…"
        />
        <div className={styles.aiControls}>
          <Input
            label="数量"
            type="number"
            value={String(aiCount)}
            onChange={(e) => setAiCount(Number(e.target.value) || 0)}
            className={styles.countInput}
          />
          <Button onClick={handleGenerate} loading={loading}>
            生成草稿
          </Button>
        </div>
        {drafts.length > 0 && (
          <div className={styles.draftList}>
            {drafts.map((d, i) => (
              <label key={i} className={styles.draftItem}>
                <input
                  type="checkbox"
                  checked={selectedDrafts.has(i)}
                  onChange={() => toggleDraft(i)}
                />
                <span className={styles.draftText}>{truncate(d.front, 80)}</span>
              </label>
            ))}
            <div className={styles.draftActions}>
              <Button
                onClick={handleConfirmDrafts}
                loading={loading}
                disabled={selectedDrafts.size === 0}
              >
                批量入库（{selectedDrafts.size}）
              </Button>
            </div>
          </div>
        )}
      </div>

      <CardGrid
        cards={cards}
        tags={tags}
        loading={loading}
        onEdit={openEdit}
        onDelete={openDelete}
      />

      <CardEditModal
        open={modalOpen}
        onClose={closeModal}
        card={editTarget}
        tags={tags}
        loading={loading}
        onSubmit={handleSubmitCard}
      />

      <Modal open={deleteTarget !== null} onClose={closeDelete} title="删除卡片">
        <p className={styles.deleteText}>
          确定删除「{deleteTarget ? truncate(toPlainText(deleteTarget.front), 30) : ''}」吗？此操作不可撤销。
        </p>
        <div className={styles.modalFooter}>
          <Button onClick={closeDelete}>取消</Button>
          <Button onClick={handleConfirmDelete} loading={loading}>
            删除
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default CardLibraryPage;
