import { mockRequest } from './request';
import { mockData } from '../../mock';
import type { Tag, TagCreateDTO, TagUpdateDTO } from '../types/tag.type';

// 标签列表：GET /api/tags
export async function getList(): Promise<Tag[]> {
  return mockRequest<Tag[]>('GET', '/api/tags', () => mockData.tags);
}

// 创建标签：POST /api/tags
export async function create(dto: TagCreateDTO): Promise<Tag> {
  return mockRequest<Tag>('POST', '/api/tags', () => mockData.tagsCreate, dto);
}

// 更新标签（部分更新）：PATCH /api/tags/:id
export async function update(id: number, dto: TagUpdateDTO): Promise<Tag> {
  return mockRequest<Tag>('PATCH', `/api/tags/${id}`, () => mockData.tagsUpdate, dto);
}

// 删除标签：DELETE /api/tags/:id
export async function remove(id: number): Promise<null> {
  return mockRequest<null>('DELETE', `/api/tags/${id}`, () => mockData.tagsDelete);
}
