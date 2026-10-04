import { mockRequest } from './request';
import { mockData, mockScenario, throwMockError } from '../../mock';
import type { Card, CardCreateDTO, CardUpdateDTO, CardDraft } from '../types/card.type';

// 列表（筛选+分页）：GET /api/cards
export async function getList(query: {
  page?: number;
  size?: number;
  keyword?: string;
  tagId?: number;
}): Promise<{ items: Card[]; total: number }> {
  return mockRequest<{ items: Card[]; total: number }>('GET', '/api/cards', () => {
    if (mockScenario.cardsListEmpty) return mockData.cardsListEmpty;
    return mockData.cardsList;
  });
}

// 单卡详情：GET /api/cards/:id
export async function getById(id: number): Promise<Card> {
  return mockRequest<Card>('GET', `/api/cards/${id}`, () => mockData.cardsDetail);
}

// 创建卡片：POST /api/cards
export async function create(dto: CardCreateDTO): Promise<Card> {
  return mockRequest<Card>('POST', '/api/cards', () => mockData.cardsCreate, dto);
}

// 批量创建（入库 AI 草稿）：POST /api/cards/batch
export async function createBatch(cards: CardCreateDTO[]): Promise<Card[]> {
  return mockRequest<Card[]>('POST', '/api/cards/batch', () => mockData.cardsBatch, { cards });
}

// AI 生成草稿（不入库）：POST /api/cards/generate
export async function generate(text: string, count?: number): Promise<CardDraft[]> {
  return mockRequest<CardDraft[]>('POST', '/api/cards/generate', () => {
    if (mockScenario.force503) throwMockError(503);
    return mockData.cardsGenerate;
  }, { text, count });
}

// 更新卡片（部分更新）：PATCH /api/cards/:id
export async function update(id: number, dto: CardUpdateDTO): Promise<Card> {
  return mockRequest<Card>('PATCH', `/api/cards/${id}`, () => mockData.cardsUpdate, dto);
}

// 删除卡片：DELETE /api/cards/:id
export async function remove(id: number): Promise<null> {
  return mockRequest<null>('DELETE', `/api/cards/${id}`, () => mockData.cardsDelete);
}

// AI 格式化 Markdown：POST /api/cards/format-markdown（契约 #20，路径属 cards 模块）
export async function formatMarkdown(content: string): Promise<{ formatted: string }> {
  return mockRequest<{ formatted: string }>('POST', '/api/cards/format-markdown', () => {
    if (mockScenario.force503) throwMockError(503);
    return mockData.cardsFormatMarkdown;
  }, { content });
}
