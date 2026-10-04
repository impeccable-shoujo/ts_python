import { mockRequest } from './request';
import { mockData } from '../../mock';
import type { Card, ReviewFeedback } from '../types/card.type';

// 今日待复习：GET /api/review/today
export async function getToday(): Promise<Card[]> {
  return mockRequest<Card[]>('GET', '/api/review/today', () => mockData.reviewToday);
}

// 提交复习结果：POST /api/review/:cardId
export async function submit(
  cardId: number,
  dto: { feedback: ReviewFeedback; durationMs?: number },
): Promise<Card> {
  return mockRequest<Card>('POST', `/api/review/${cardId}`, () => mockData.reviewSubmit, dto);
}

// 复习统计：GET /api/review/stats
export async function getStats(): Promise<{
  byFeedback: { feedback: ReviewFeedback; count: number }[];
  byDay: { date: string; count: number }[];
}> {
  return mockRequest<{
    byFeedback: { feedback: ReviewFeedback; count: number }[];
    byDay: { date: string; count: number }[];
  }>('GET', '/api/review/stats', () => mockData.reviewStats);
}

// 随机抽卡：POST /api/quiz/generate
export async function quizGenerate(dto: { count?: number; tagIds?: number[] }): Promise<Card[]> {
  return mockRequest<Card[]>('POST', '/api/quiz/generate', () => mockData.quizGenerate, dto);
}

// 提交检测结果：POST /api/quiz/submit
export async function quizSubmit(results: { cardId: number; correct: boolean }[]): Promise<{
  totalCount: number;
  correctCount: number;
}> {
  return mockRequest<{ totalCount: number; correctCount: number }>(
    'POST',
    '/api/quiz/submit',
    () => mockData.quizSubmit,
    { results },
  );
}
