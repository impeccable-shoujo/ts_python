# 契约基准 · 共享类型清单 + REST API 总表

> 本文件是前端 `types/` 与 mock 数据的唯一来源（契约基准 v1.0）。
> 来源：开发-修订版 v2 的 5.3/5.4 + 第 0.2 节拍板结果（14 处缺口全部按推荐做法，更新类接口一律 PATCH）。
> 使用规则：前端 types 逐字复制第 1 部分；mock 与联调以第 2 部分为准。禁止本地改动字段名/类型。

---

## 第 1 部分 · 共享类型清单（前端 types/ 全部内容）

### types/common.type.ts

```ts
// 本文件来自总纲契约 v1.0，禁止本地修改
export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}
```

### types/user.type.ts

```ts
// 本文件来自总纲契约 v1.0，禁止本地修改
export interface User {
  id: number;
  username: string;
  email: string | null;
  createdAt: string;
}

// 登录/注册响应体（拍板结果：只回 token + 最小用户信息）
export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
  };
}
```

### types/card.type.ts

```ts
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
```

### types/tag.type.ts

```ts
// 本文件来自总纲契约 v1.0，禁止本地修改
export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface TagCreateDTO {
  name: string;
  color: string;
}

export interface TagUpdateDTO {
  name?: string;
  color?: string;
}
```

> 补充说明：① `Card.tagIds` 为多对多关系派生的标签 id 数组（服务端由 `tags` 关系组装，schema 无此列）；② 所有 `DateTime` 字段过 API 均为 ISO 字符串；③ 分页列表统一返回 `{ items: T[]; total: number }`（见下各列表接口）。

---

## 第 2 部分 · REST API 契约总表

统一响应体：`{ code: number; data: T; message: string }`，成功 `code=200`、`message="success"`；错误 `{ code, data: null, message }`。

错误码约定：`400` 参数/请求体校验失败；`401` 未认证（token 缺失或无效）；`403` 无权限访问他人资源；`404` 资源不存在；`503` AI 服务不可用（LLM 超时/失败）。

### 接口总览（共 20 条 = 5.4 原 15 条 + 拍板新增 5 条）

| # | 模块 | 方法 | 路径 | 鉴权 | 说明 |
| --- | --- | --- | --- | --- | --- |
| 1 | 认证 | POST | /api/auth/register | 否 | 用户注册 |
| 2 | 认证 | POST | /api/auth/login | 否 | 用户登录 |
| 3 | 认证 | GET | /api/auth/me | 是 | 当前用户信息 |
| 4 | 卡片 | GET | /api/cards | 是 | 列表（筛选+分页） |
| 5 | 卡片 | POST | /api/cards | 是 | 创建卡片 |
| 6 | 卡片 | POST | /api/cards/generate | 是 | AI 从文本生成草稿 |
| 7 | 卡片 | POST | /api/cards/batch | 是 | 批量创建（入库 AI 草稿）★新增 |
| 8 | 卡片 | GET | /api/cards/:id | 是 | 单卡详情 ★新增 |
| 9 | 卡片 | PATCH | /api/cards/:id | 是 | 更新卡片（PUT 改 PATCH） |
| 10 | 卡片 | DELETE | /api/cards/:id | 是 | 删除卡片 |
| 11 | 标签 | GET | /api/tags | 是 | 标签列表 |
| 12 | 标签 | POST | /api/tags | 是 | 创建标签 |
| 13 | 标签 | PATCH | /api/tags/:id | 是 | 更新标签 ★新增 |
| 14 | 标签 | DELETE | /api/tags/:id | 是 | 删除标签 ★新增 |
| 15 | 复习 | GET | /api/review/today | 是 | 今日待复习 |
| 16 | 复习 | POST | /api/review/:cardId | 是 | 提交复习结果 |
| 17 | 复习 | GET | /api/review/stats | 是 | 复习统计 |
| 18 | 抽卡 | POST | /api/quiz/generate | 是 | 随机抽卡 |
| 19 | 抽卡 | POST | /api/quiz/submit | 是 | 提交检测结果 |
| 20 | AI | POST | /api/cards/format-markdown | 是 | AI 格式化 Markdown ★新增 |

> ★ 标注为第 0.2 节拍板新增接口（5 条）。原 15 条中 `PUT /api/cards/:id` 按拍板统一改为 `PATCH`。

---

### 认证

**#1 POST /api/auth/register**（公开）
请求体：`{ username: string; password: string; email?: string }`
响应 data：`AuthResponse`
```json
{ "code": 200, "data": { "token": "jwt...", "user": { "id": 1, "username": "alice" } }, "message": "success" }
```
错误码：`400`（username 已存在/校验失败）

**#2 POST /api/auth/login**（公开）
请求体：`{ username: string; password: string }`
响应 data：`AuthResponse`
```json
{ "code": 200, "data": { "token": "jwt...", "user": { "id": 1, "username": "alice" } }, "message": "success" }
```
错误码：`401`（用户名或密码错误）

**#3 GET /api/auth/me**（需鉴权）
响应 data：`User`
```json
{ "code": 200, "data": { "id": 1, "username": "alice", "email": "a@b.com", "createdAt": "2026-09-22T10:00:00.000Z" }, "message": "success" }
```
错误码：`401`

---

### 卡片

**#4 GET /api/cards**（需鉴权）——筛选 + 分页
Query：`page=1`（默认 1）、`size=20`（默认 20）、`keyword`（模糊匹配 front/back）、`tagId`（按标签筛选）
响应 data：`{ items: Card[]; total: number }`
```json
{ "code": 200, "data": { "items": [ { "id": 1, "front": "**Q1**", "back": "A1", "nextReviewAt": "2026-09-23T00:00:00.000Z", "reviewCount": 0, "interval": 1, "easeFactor": 2.5, "createdAt": "2026-09-22T10:00:00.000Z", "updatedAt": "2026-09-22T10:00:00.000Z", "tagIds": [1] } ], "total": 1 }, "message": "success" }
```
错误码：`400`、`401`

**#5 POST /api/cards**（需鉴权）
请求体：`CardCreateDTO`（`{ front, back, tagIds? }`）
响应 data：`Card`
```json
{ "code": 200, "data": { "id": 2, "front": "正面", "back": "背面", "nextReviewAt": "2026-09-23T00:00:00.000Z", "reviewCount": 0, "interval": 1, "easeFactor": 2.5, "createdAt": "2026-09-22T12:00:00.000Z", "updatedAt": "2026-09-22T12:00:00.000Z", "tagIds": [] }, "message": "success" }
```
错误码：`400`（front/back 为空）、`401`

**#6 POST /api/cards/generate**（需鉴权）——AI 生成草稿（不入库）
请求体：`{ text: string; count?: number }`（count 默认 10）
响应 data：`CardDraft[]`
```json
{ "code": 200, "data": [ { "front": "什么是艾宾浩斯遗忘曲线？", "back": "记忆随时间衰减的曲线" } ], "message": "success" }
```
错误码：`400`、`401`、`503`（LLM 超时/失败）

**#7 POST /api/cards/batch**（需鉴权）★——批量创建（入库 AI 草稿）
请求体：`{ cards: CardCreateDTO[] }`
响应 data：`Card[]`
```json
{ "code": 200, "data": [ { "id": 3, "front": "Q", "back": "A", "nextReviewAt": "2026-09-23T00:00:00.000Z", "reviewCount": 0, "interval": 1, "easeFactor": 2.5, "createdAt": "2026-09-22T12:00:00.000Z", "updatedAt": "2026-09-22T12:00:00.000Z", "tagIds": [] } ], "message": "success" }
```
错误码：`400`（cards 为空）、`401`

**#8 GET /api/cards/:id**（需鉴权）★——单卡详情
响应 data：`Card`
```json
{ "code": 200, "data": { "id": 1, "front": "**Q1**", "back": "A1", "nextReviewAt": "2026-09-23T00:00:00.000Z", "reviewCount": 0, "interval": 1, "easeFactor": 2.5, "createdAt": "2026-09-22T10:00:00.000Z", "updatedAt": "2026-09-22T10:00:00.000Z", "tagIds": [1] }, "message": "success" }
```
错误码：`401`、`404`

**#9 PATCH /api/cards/:id**（需鉴权）
请求体：`CardUpdateDTO`（`{ front?, back?, tagIds? }`，部分更新）
响应 data：`Card`
```json
{ "code": 200, "data": { "id": 1, "front": "改后", "back": "A1", "nextReviewAt": "2026-09-23T00:00:00.000Z", "reviewCount": 0, "interval": 1, "easeFactor": 2.5, "createdAt": "2026-09-22T10:00:00.000Z", "updatedAt": "2026-09-22T13:00:00.000Z", "tagIds": [1] }, "message": "success" }
```
错误码：`400`、`401`、`403`（他人卡片）、`404`

**#10 DELETE /api/cards/:id**（需鉴权）
响应 data：`null`
```json
{ "code": 200, "data": null, "message": "success" }
```
错误码：`401`、`403`、`404`

---

### 标签

**#11 GET /api/tags**（需鉴权）
响应 data：`Tag[]`
```json
{ "code": 200, "data": [ { "id": 1, "name": "数学", "color": "#f5222d" } ], "message": "success" }
```
错误码：`401`

**#12 POST /api/tags**（需鉴权）
请求体：`TagCreateDTO`（`{ name, color }`）
响应 data：`Tag`
```json
{ "code": 200, "data": { "id": 2, "name": "英语", "color": "#1890ff" }, "message": "success" }
```
错误码：`400`（重名）、`401`

**#13 PATCH /api/tags/:id**（需鉴权）★
请求体：`TagUpdateDTO`（`{ name?, color? }`，部分更新）
响应 data：`Tag`
```json
{ "code": 200, "data": { "id": 1, "name": "高等数学", "color": "#f5222d" }, "message": "success" }
```
错误码：`400`（重名）、`401`、`403`、`404`

**#14 DELETE /api/tags/:id**（需鉴权）★
响应 data：`null`
```json
{ "code": 200, "data": null, "message": "success" }
```
错误码：`401`、`403`、`404`

---

### 复习

**#15 GET /api/review/today**（需鉴权）
响应 data：`Card[]`（`nextReviewAt <= now` 的待复习卡片）
```json
{ "code": 200, "data": [ { "id": 1, "front": "**Q1**", "back": "A1", "nextReviewAt": "2026-09-22T08:00:00.000Z", "reviewCount": 0, "interval": 1, "easeFactor": 2.5, "createdAt": "2026-09-22T10:00:00.000Z", "updatedAt": "2026-09-22T10:00:00.000Z", "tagIds": [] } ], "message": "success" }
```
错误码：`401`

**#16 POST /api/review/:cardId**（需鉴权）
请求体：`{ feedback: ReviewFeedback; durationMs?: number }`
响应 data：`Card`（SM-2 更新后的卡片）
```json
{ "code": 200, "data": { "id": 1, "front": "**Q1**", "back": "A1", "nextReviewAt": "2026-09-28T00:00:00.000Z", "reviewCount": 1, "interval": 6, "easeFactor": 2.5, "createdAt": "2026-09-22T10:00:00.000Z", "updatedAt": "2026-09-22T14:00:00.000Z", "tagIds": [] }, "message": "success" }
```
错误码：`400`（feedback 非法）、`401`、`403`、`404`

**#17 GET /api/review/stats**（需鉴权）
响应 data：`{ byFeedback: { feedback: ReviewFeedback; count: number }[]; byDay: { date: string; count: number }[] }`
```json
{ "code": 200, "data": { "byFeedback": [ { "feedback": "remember", "count": 12 }, { "feedback": "fuzzy", "count": 3 }, { "feedback": "forget", "count": 2 } ], "byDay": [ { "date": "2026-09-22", "count": 5 }, { "date": "2026-09-21", "count": 8 } ] }, "message": "success" }
```
错误码：`401`

---

### 抽卡

**#18 POST /api/quiz/generate**（需鉴权）
请求体：`{ count?: number; tagIds?: number[] }`
响应 data：`Card[]`（随机抽取，默认不重复）
```json
{ "code": 200, "data": [ { "id": 5, "front": "抽卡题面", "back": "答案", "nextReviewAt": "2026-09-23T00:00:00.000Z", "reviewCount": 0, "interval": 1, "easeFactor": 2.5, "createdAt": "2026-09-22T10:00:00.000Z", "updatedAt": "2026-09-22T10:00:00.000Z", "tagIds": [] } ], "message": "success" }
```
错误码：`400`、`401`

**#19 POST /api/quiz/submit**（需鉴权）
请求体：`{ results: { cardId: number; correct: boolean }[] }`
响应 data：`{ totalCount: number; correctCount: number }`
```json
{ "code": 200, "data": { "totalCount": 10, "correctCount": 7 }, "message": "success" }
```
错误码：`400`、`401`

---

### AI

**#20 POST /api/cards/format-markdown**（需鉴权）★
请求体：`{ content: string }`
响应 data：`{ formatted: string }`
```json
{ "code": 200, "data": { "formatted": "# 标题\n\n- 列表项" }, "message": "success" }
```
错误码：`400`（content 为空）、`401`、`503`（LLM 超时/失败）
