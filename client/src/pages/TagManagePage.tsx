import { useEffect, useState, type ChangeEvent, type ReactElement } from 'react';
import { useTagStore } from '../store/tagStore';
import { useCardStore } from '../store/cardStore';
import type { Tag } from '../types/tag.type';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';
import styles from './TagManagePage.module.css';

const DEFAULT_COLOR = '#2563eb';

// 标签管理页：列表 + 新建/编辑（name + 六位十六进制颜色）+ 删除（关联提示）。全部数据经 store。
function TagManagePage(): ReactElement {
  const tags = useTagStore((s) => s.tags);
  const loading = useTagStore((s) => s.loading);
  const error = useTagStore((s) => s.error);
  const fetchTags = useTagStore((s) => s.fetchTags);
  const createTag = useTagStore((s) => s.createTag);
  const updateTag = useTagStore((s) => s.updateTag);
  const removeTag = useTagStore((s) => s.removeTag);

  // 用于删除提示：统计每个标签被多少卡片关联（经 cardStore 取数，不直接调 service）。
  const cards = useCardStore((s) => s.cards);
  const fetchCards = useCardStore((s) => s.fetchCards);

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Tag | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [nameError, setNameError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null);

  useEffect(() => {
    void fetchTags();
  }, [fetchTags]);
  useEffect(() => {
    void fetchCards();
  }, [fetchCards]);

  const usedCount = (tagId: number): number =>
    cards.filter((c) => c.tagIds.includes(tagId)).length;

  const openCreate = (): void => {
    setEditTarget(null);
    setName('');
    setColor(DEFAULT_COLOR);
    setNameError(null);
    setModalOpen(true);
  };
  const openEdit = (tag: Tag): void => {
    setEditTarget(tag);
    setName(tag.name);
    setColor(tag.color);
    setNameError(null);
    setModalOpen(true);
  };
  const closeModal = (): void => {
    setModalOpen(false);
    setEditTarget(null);
  };

  const handleColorChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setColor(e.target.value);
  };

  const handleSave = async (): Promise<void> => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('名称不能为空');
      return;
    }
    if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
      setNameError('颜色需为六位十六进制（如 #2563eb）');
      return;
    }
    setNameError(null);
    if (editTarget) {
      await updateTag(editTarget.id, { name: trimmed, color });
    } else {
      await createTag({ name: trimmed, color });
    }
    // 提交后依据 store.error 决定是否关闭弹窗（失败则留在弹窗并展示错误）。
    if (!useTagStore.getState().error) closeModal();
  };

  const openDelete = (tag: Tag): void => {
    setDeleteTarget(tag);
  };
  const closeDelete = (): void => {
    setDeleteTarget(null);
  };
  const handleConfirmDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    await removeTag(deleteTarget.id);
    if (!useTagStore.getState().error) closeDelete();
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>标签管理</h2>
        <Button onClick={openCreate}>新建标签</Button>
      </div>

      <ErrorMessage message={error} />

      {loading && tags.length === 0 ? (
        <div className={styles.hint}>加载中…</div>
      ) : tags.length === 0 ? (
        <EmptyState
          message={error ? '加载失败' : '还没有标签，点击「新建标签」开始吧'}
          action={error ? <Button onClick={() => void fetchTags()}>重试</Button> : undefined}
        />
      ) : (
        <ul className={styles.list}>
          {tags.map((tag) => (
            <li key={tag.id} className={styles.item}>
              <span className={styles.swatch} style={{ backgroundColor: tag.color }} />
              <span className={styles.name}>{tag.name}</span>
              <span className={styles.actions}>
                <button type="button" className={styles.editBtn} onClick={() => openEdit(tag)}>
                  编辑
                </button>
                <button type="button" className={styles.delBtn} onClick={() => openDelete(tag)}>
                  删除
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editTarget ? '编辑标签' : '新建标签'}>
        <div className={styles.form}>
          <Input
            label="名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={nameError ?? undefined}
            placeholder="标签名称"
          />
          <div className={styles.colorField}>
            <label className={styles.colorLabel}>颜色（六位十六进制）</label>
            <div className={styles.colorRow}>
              <input type="color" value={color} onChange={handleColorChange} className={styles.colorInput} />
              <span className={styles.colorValue}>{color}</span>
            </div>
          </div>
          <div className={styles.footer}>
            <Button onClick={closeModal}>取消</Button>
            <Button onClick={() => void handleSave()} loading={loading} disabled={loading}>
              保存
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={deleteTarget !== null} onClose={closeDelete} title="删除标签">
        <div className={styles.deleteBox}>
          <p className={styles.deleteText}>确定删除标签「{deleteTarget?.name}」吗？此操作不可撤销。</p>
          {deleteTarget && usedCount(deleteTarget.id) > 0 && (
            <p className={styles.warnText}>
              该标签已关联 {usedCount(deleteTarget.id)} 张卡片，删除后将解除关联。
            </p>
          )}
          <div className={styles.footer}>
            <Button onClick={closeDelete}>取消</Button>
            <Button onClick={() => void handleConfirmDelete()} loading={loading} disabled={loading}>
              删除
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default TagManagePage;
