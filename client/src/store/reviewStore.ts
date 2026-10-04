import { create } from 'zustand';
import {
  getToday as getTodayApi,
  submit as submitApi,
  getStats as getStatsApi,
  quizGenerate as quizGenerateApi,
  quizSubmit as quizSubmitApi,
} from '../services/review.service';
import type { Card, ReviewFeedback } from '../types/card.type';

// 以下三个类型在总纲 types 层未登记（全 docs/contracts.md 检索无命中），按 cardStore 处理 CardQueryDTO 的同类做法在 Store 内本地定义，
// 仅用于本 Store 内部状态约束；建议回总纲会话登记后改为从 types 层导入，以统一类型来源。
interface ReviewStats {
  byFeedback: { feedback: ReviewFeedback; count: number }[];
  byDay: { date: string; count: number }[];
}

interface QuizCard {
  id: number;
  front: string;
}

interface QuizSubmitResult {
  cardId: number;
  correct: boolean;
}

interface ReviewState {
  todayCards: Card[];
  currentIndex: number;
  stats: ReviewStats | null;
  submitting: boolean;
  loading: boolean;
  error: string | null;
  quizCards: QuizCard[];
  quizResults: QuizSubmitResult[];
  fetchToday: () => Promise<void>;
  submitReview: (cardId: number, feedback: ReviewFeedback, durationMs?: number) => Promise<void>;
  fetchStats: () => Promise<void>;
  startQuiz: (count?: number, tagIds?: number[]) => Promise<void>;
  submitQuiz: (results: QuizSubmitResult[]) => Promise<void>;
}

export const useReviewStore = create<ReviewState>()((set, get) => ({
  todayCards: [],
  currentIndex: 0,
  stats: null,
  submitting: false,
  loading: false,
  error: null,
  quizCards: [],
  quizResults: [],

  // 今日待复习：GET /api/review/today；成功后重置 currentIndex。
  async fetchToday(): Promise<void> {
    set({ loading: true, error: null });
    try {
      const todayCards = await getTodayApi();
      set({ todayCards, currentIndex: 0, loading: false });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : '获取今日复习失败', loading: false });
    }
  },

  // 提交复习结果：POST /api/review/:cardId；成功后 currentIndex+1，队列空了自动重拉 today。
  async submitReview(cardId: number, feedback: ReviewFeedback, durationMs?: number): Promise<void> {
    set({ submitting: true, error: null });
    try {
      await submitApi(cardId, { feedback, durationMs });
      const { currentIndex, todayCards } = get();
      const next = currentIndex + 1;
      if (next >= todayCards.length) {
        // 队列空了：清空提交态并自动重拉 today（currentIndex 在 fetchToday 内复位为 0）。
        set({ submitting: false });
        await get().fetchToday();
      } else {
        set({ currentIndex: next, submitting: false });
      }
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : '提交复习结果失败', submitting: false });
    }
  },

  // 复习统计：GET /api/review/stats（缺口 11 拍板：stats 收进 reviewStore，不建独立 statsStore）。
  async fetchStats(): Promise<void> {
    set({ loading: true, error: null });
    try {
      const stats = await getStatsApi();
      set({ stats, loading: false });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : '获取统计失败', loading: false });
    }
  },

  // 随机抽卡：POST /api/quiz/generate；service 返回 Card[]，映射为 QuizCard[] 存于 quizCards。
  async startQuiz(count?: number, tagIds?: number[]): Promise<void> {
    set({ loading: true, error: null });
    try {
      const cards = await quizGenerateApi({ count, tagIds });
      const quizCards: QuizCard[] = cards.map((c: Card) => ({ id: c.id, front: c.front }));
      set({ quizCards, loading: false });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : '生成抽卡失败', loading: false });
    }
  },

  // 提交检测结果：POST /api/quiz/submit；results 原样透传给 service，并存入 quizResults。
  async submitQuiz(results: QuizSubmitResult[]): Promise<void> {
    set({ loading: true, error: null });
    try {
      await quizSubmitApi(results);
      set({ quizResults: results, loading: false });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : '提交检测结果失败', loading: false });
    }
  },
}));
