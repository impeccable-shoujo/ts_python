// 本文件来自总纲契约 v1.0，禁止本地修改
export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}
