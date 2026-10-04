import { mockRequest } from './request';
import { mockData } from '../../mock';
import type { AuthResponse, User } from '../types/user.type';

// 注册：POST /api/auth/register；成功后写入 token 到 localStorage。
export async function register(dto: {
  username: string;
  password: string;
  email?: string;
}): Promise<AuthResponse> {
  const res = await mockRequest<AuthResponse>(
    'POST',
    '/api/auth/register',
    () => mockData.authRegister,
    dto,
  );
  localStorage.setItem('token', res.token);
  return res;
}

// 登录：POST /api/auth/login；成功后写入 token 到 localStorage。
export async function login(dto: { username: string; password: string }): Promise<AuthResponse> {
  const res = await mockRequest<AuthResponse>('POST', '/api/auth/login', () => mockData.authLogin, dto);
  localStorage.setItem('token', res.token);
  return res;
}

// 当前用户：GET /api/auth/me；token 由请求拦截器自动附带。
export async function getMe(): Promise<User> {
  return mockRequest<User>('GET', '/api/auth/me', () => mockData.authMe);
}
