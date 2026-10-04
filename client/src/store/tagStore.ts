import { create } from 'zustand';
import {
  getList as getListApi,
  create as createApi,
  update as updateApi,
  remove as removeApi,
} from '../services/tag.service';
import type { Tag, TagCreateDTO, TagUpdateDTO } from '../types/tag.type';

interface TagState {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  fetchTags: () => Promise<void>;
  createTag: (dto: TagCreateDTO) => Promise<void>;
  updateTag: (id: number, dto: TagUpdateDTO) => Promise<void>;
  removeTag: (id: number) => Promise<void>;
}

export const useTagStore = create<TagState>()((set, get) => ({
  tags: [],
  loading: false,
  error: null,

  // 标签列表：GET /api/tags；成功后写 tags。
  async fetchTags(): Promise<void> {
    set({ loading: true, error: null });
    try {
      const tags = await getListApi();
      set({ tags, loading: false });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : '获取标签列表失败', loading: false });
    }
  },

  // 创建标签：POST /api/tags；成功后重拉列表保持一致。
  async createTag(dto: TagCreateDTO): Promise<void> {
    set({ loading: true, error: null });
    try {
      await createApi(dto);
      set({ loading: false });
      await get().fetchTags();
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : '创建标签失败', loading: false });
    }
  },

  // 更新标签（部分更新）：PATCH /api/tags/:id；成功后重拉列表保持一致。
  async updateTag(id: number, dto: TagUpdateDTO): Promise<void> {
    set({ loading: true, error: null });
    try {
      await updateApi(id, dto);
      set({ loading: false });
      await get().fetchTags();
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : '更新标签失败', loading: false });
    }
  },

  // 删除标签：DELETE /api/tags/:id；成功后重拉列表保持一致。
  async removeTag(id: number): Promise<void> {
    set({ loading: true, error: null });
    try {
      await removeApi(id);
      set({ loading: false });
      await get().fetchTags();
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : '删除标签失败', loading: false });
    }
  },
}));
