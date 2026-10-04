// 本文件来自总纲契约 v1.0，禁止本地修改
export type ReviewFeedback = 'forget' | 'fuzzy' | 'remember';

export interface Card {
  id: number;
  front: string;
  back: string;
  nextReviewAt: string;
  reviewCount: number;
  interval: number;
  easeFactor: number;
  createdAt: string;
  updatedAt: string;
  tagIds: number[];
}

export interface CardCreateDTO {
  front: string;
  back: string;
  tagIds?: number[];
}

export interface CardUpdateDTO {
  front?: string;
  back?: string;
  tagIds?: number[];
}

export interface CardDraft {
  front: string;
  back: string;
}
