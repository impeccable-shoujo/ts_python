# Mock 契约（json-server 托管）

> 本目录是前端会话的 mock 数据源，与 `docs/contracts.md`（契约基准 v1.0）逐字段对齐。
> 启动后前端无需等后端，即可基于这些数据开发状态层与 UI 层。

## 一键启动

```bash
# 在 monorepo 根目录执行
npm run mock
```

启动后服务监听 **http://localhost:3001**。json-server 会把本目录 `db.json` 的**每个顶层 key 当作一个路由**。

验证：

```bash
curl http://localhost:3001/cards
# → {"code":200,"data":{"items":[...],"total":12},"message":"success"}
```

## 统一响应体

所有 mock 数据外层严格包 `{ code, data, message }`：

- 成功：`code=200`、`message="success"`
- 未授权：`code=401`、`data=null`
- 无权限：`code=403`、`data=null`
- 资源不存在：`code=404`、`data=null`
- AI 失败：`code=503`、`data=null`

字段名与契约逐字段一致（驼峰、无 `difficulty`、前端 `Card` 不含 `userId`、`User` 不含 `passwordHash`）。

## 接口 → 数据映射表

> json-server 路由不带 `/api` 前缀，子路径用短横线 `-` 表示。契约里的 `:id` 统一由 `cards-detail` 等 key 提供样例。

| # | 契约路径 | 方法 | json-server 路由（key） | 说明 |
| --- | --- | --- | --- | --- |
| 1 | /api/auth/register | POST | `/auth-register` | 返回 `AuthResponse` |
| 2 | /api/auth/login | POST | `/auth-login` | 返回 `AuthResponse` |
| 3 | /api/auth/me | GET | `/auth-me` | 返回 `User` |
| 4 | /api/cards | GET | `/cards` | 返回 `{items,total}` |
| 5 | /api/cards | POST | `/cards-create` | 返回新建 `Card` |
| 6 | /api/cards/generate | POST | `/cards-generate` | 返回 `CardDraft[]` |
| 7 | /api/cards/batch | POST | `/cards-batch` | 返回 `Card[]` |
| 8 | /api/cards/:id | GET | `/cards-detail` | 返回单张 `Card` |
| 9 | /api/cards/:id | PATCH | `/cards-update` | 返回更新后 `Card` |
| 10 | /api/cards/:id | DELETE | `/cards-delete` | 返回 `data:null` |
| 11 | /api/tags | GET | `/tags` | 返回 `Tag[]` |
| 12 | /api/tags | POST | `/tags-create` | 返回新建 `Tag` |
| 13 | /api/tags/:id | PATCH | `/tags-update` | 返回更新后 `Tag` |
| 14 | /api/tags/:id | DELETE | `/tags-delete` | 返回 `data:null` |
| 15 | /api/review/today | GET | `/review-today` | 返回待复习 `Card[]` |
| 16 | /api/review/:cardId | POST | `/review-submit` | 返回 SM-2 更新后 `Card` |
| 17 | /api/review/stats | GET | `/review-stats` | 返回 `{byFeedback,byDay}` |
| 18 | /api/quiz/generate | POST | `/quiz-generate` | 返回随机 `Card[]` |
| 19 | /api/quiz/submit | POST | `/quiz-submit` | 返回 `{totalCount,correctCount}` |
| 20 | /api/cards/format-markdown | POST | `/cards-format-markdown` | 返回 `{formatted}` |

## 边界场景数据与触发

| 场景 | json-server 路由 | 说明 |
| --- | --- | --- |
| 卡片列表为空 | `/cards-empty` | `items:[]`、`total:0` |
| 卡片分页最后一页 | `/cards-page-last` | `total:12`、`items` 仅 1 条（模拟最后一页） |
| 标签列表为空 | `/tags-empty` | `data:[]` |
| 今日待复习为空 | `/review-today-empty` | `data:[]` |
| 未授权 401 | `/error-401` | `{code:401,data:null,message:"unauthorized"}` |
| 无权限 403 | `/error-403` | `{code:403,data:null,message:"forbidden"}` |
| 资源不存在 404 | `/error-404` | `{code:404,data:null,message:"not found"}` |
| AI 失败 503 | `/error-503` | `{code:503,data:null,message:"AI service unavailable"}`（对应 generate / format-markdown） |

> 说明：json-server CLI 的「单例对象」模式会把 key 的值原样返回，天然带 `{code,data,message}` 外层；分页、401/503 等边界场景无法由 json-server 原生按状态码触发，故以独立 key 静态提供，前端在联调/开发期手动切换路由即可。

## 前端如何切换 mock / 真实

见 `client/src/services/request.ts` 顶部的 `USE_MOCK` 开关：

- `USE_MOCK = true`：`baseURL` 指向 `http://localhost:3001`（json-server，路径不带 `/api`，直接对应上表路由）。
- `USE_MOCK = false`：`baseURL` 指向 `/api`（真实后端，走 3000 端口，路径带 `/api`）。

联调时只需改这一个常量，不改任何业务代码。
