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
