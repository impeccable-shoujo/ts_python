// Mock 数据模块：从 P1-5 db.json 抽取业务数据，供 services 的 mock 分支 resolver 读取。
// resolver 只返回 data 字段（与真实分支经响应拦截器解包后的结果一致），不返回 {code,data,message} 外层。
import db from './db.json';
import type { Card, CardDraft, ReviewFeedback } from '../src/types/card.type';
import type { Tag } from '../src/types/tag.type';
import type { User, AuthResponse } from '../src/types/user.type';

export const mockData = {
  // 卡片
  cardsList: db.cards.data as { items: Card[]; total: number },
  cardsListEmpty: db['cards-empty'].data as { items: Card[]; total: number },
  cardsListPageLast: db['cards-page-last'].data as { items: Card[]; total: number },
  cardsDetail: db['cards-detail'].data as Card,
  cardsCreate: db['cards-create'].data as Card,
  cardsGenerate: db['cards-generate'].data as CardDraft[],
  cardsBatch: db['cards-batch'].data as Card[],
  cardsUpdate: db['cards-update'].data as Card,
  cardsDelete: db['cards-delete'].data as null,
  cardsFormatMarkdown: db['cards-format-markdown'].data as { formatted: string },
  // 标签
  tags: db.tags.data as Tag[],
  tagsEmpty: db['tags-empty'].data as Tag[],
  tagsCreate: db['tags-create'].data as Tag,
  tagsUpdate: db['tags-update'].data as Tag,
  tagsDelete: db['tags-delete'].data as null,
  // 认证
  authRegister: db['auth-register'].data as AuthResponse,
  authLogin: db['auth-login'].data as AuthResponse,
  authMe: db['auth-me'].data as User,
  // 复习
  reviewToday: db['review-today'].data as Card[],
  reviewTodayEmpty: db['review-today-empty'].data as Card[],
  reviewSubmit: db['review-submit'].data as Card,
  reviewStats: db['review-stats'].data as {
    byFeedback: { feedback: ReviewFeedback; count: number }[];
    byDay: { date: string; count: number }[];
  },
  // 抽卡
  quizGenerate: db['quiz-generate'].data as Card[],
  quizSubmit: db['quiz-submit'].data as { totalCount: number; correctCount: number },
};

// 边界错误文案（与真实响应拦截器 reject 携带的 message 一致）。
export const mockErrors = {
  unauthorized: db['error-401'].message,
  forbidden: db['error-403'].message,
  notFound: db['error-404'].message,
  aiUnavailable: db['error-503'].message,
};

// 开发/联调期手动切换边界场景的开关；默认全 false = 走正常成功数据。
export const mockScenario = {
  cardsListEmpty: false,
  force503: false,
};

// 抛出与真实响应拦截器一致的错误（仅 message，不含 code）。
export function throwMockError(code: 401 | 403 | 404 | 503): never {
  const message =
    code === 401
      ? mockErrors.unauthorized
      : code === 403
        ? mockErrors.forbidden
        : code === 404
          ? mockErrors.notFound
          : mockErrors.aiUnavailable;
  throw new Error(message);
}
