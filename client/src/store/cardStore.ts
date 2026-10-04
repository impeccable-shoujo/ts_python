import { create } from 'zustand';
import {
  getList as getListApi,
  getById as getByIdApi,
  create as createApi,
  createBatch as createBatchApi,
  generate as generateApi,
  update as updateApi,
  remove as removeApi,
} from '../services/card.service';
import type { Card, CardCreateDTO, CardUpdateDTO, CardDraft } from '../types/card.type';

// 卡片列表查询条件（与 services/card.service.getList 形参一致；总纲 types 未定义，本地定义，不与总纲同名类型冲突）。
interface CardQueryDTO {
  page?: number;
  size?: number;
  keyword?: string;
  tagId?: number;
}

interface CardState {
  cards: Card[];
  total: number;
  query: CardQueryDTO;
  current: Card | null;
  drafts: CardDraft[];
  loading: boolean;
  error: string | null;
  fetchCards: () => Promise<void>;
  fetchCard: (id: number) => Promise<void>;
  createCard: (dto: CardCreateDTO) => Promise<void>;
  createBatch: (cards: CardCreateDTO[]) => Promise<void>;
  generateDrafts: (text: string, count?: number) => Promise<void>;
  confirmDrafts: () => Promise<void>;
  updateCard: (id: number, dto: CardUpdateDTO) => Promise<void>;
  removeCard: (id: number) => Promise<void>;
}

const DEFAULT_QUERY: CardQueryDTO = { page: 1, size: 20 };

export const useCardStore = create<CardState>()((set, get) => ({
  cards: [],
  total: 0,
  query: DEFAULT_QUERY,
  current: null,
  drafts: [],
  loading: false,
  error: null,

  // 拉取列表（按当前 query）；成功后写 cards/total。
  async fetchCards(): Promise<void> {
    set({ loading: true, error: null });
    try {
      const { query } = get();
      const res = await getListApi(query);
      set({ cards: res.items, total: res.total, loading: false });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : '获取卡片列表失败', loading: false });
    }
  },

  // 拉取单卡详情；成功后写 current。
  async fetchCard(id: number): Promise<void> {
    set({ loading: true, error: null });
    try {
      const card = await getByIdApi(id);
      set({ current: card, loading: false });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : '获取卡片详情失败', loading: false });
    }
  },

  // 创建卡片；成功后重拉列表保持一致。
  async createCard(dto: CardCreateDTO): Promise<void> {
    set({ loading: true, error: null });
    try {
      await createApi(dto);
      set({ loading: false });
      await get().fetchCards();
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : '创建卡片失败', loading: false });
    }
  },

  // 批量创建；成功后重拉列表保持一致。
  async createBatch(cards: CardCreateDTO[]): Promise<void> {
    set({ loading: true, error: null });
    try {
      await createBatchApi(cards);
      set({ loading: false });
      await get().fetchCards();
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : '批量创建失败', loading: false });
    }
  },

  // AI 生成草稿（不入库）；成功后写 drafts。
  async generateDrafts(text: string, count?: number): Promise<void> {
    set({ loading: true, error: null });
    try {
      const drafts = await generateApi(text, count);
      set({ drafts, loading: false });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : '生成草稿失败', loading: false });
    }
  },

  // 确认草稿：把 drafts 提交为批量创建，并清空 drafts；成功后重拉列表。
  async confirmDrafts(): Promise<void> {
    const { drafts } = get();
    if (drafts.length === 0) return;
    set({ loading: true, error: null });
    try {
      await createBatchApi(drafts);
      set({ drafts: [], loading: false });
      await get().fetchCards();
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : '确认草稿失败', loading: false });
    }
  },

  // 更新卡片；成功后重拉列表保持一致。
  async updateCard(id: number, dto: CardUpdateDTO): Promise<void> {
    set({ loading: true, error: null });
    try {
      await updateApi(id, dto);
      set({ loading: false });
      await get().fetchCards();
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : '更新卡片失败', loading: false });
    }
  },

  // 删除卡片；成功后重拉列表保持一致。
  async removeCard(id: number): Promise<void> {
    set({ loading: true, error: null });
    try {
      await removeApi(id);
      set({ loading: false });
      await get().fetchCards();
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : '删除卡片失败', loading: false });
    }
  },
}));
