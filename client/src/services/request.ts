import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiResponse } from '../types/common.type';

// mock 开关：true 时业务接口不发起真实请求，改用 resolver 返回 client/mock 数据；联调切 VITE_USE_MOCK=false 走真实后端。
const USE_MOCK: boolean = import.meta.env.VITE_USE_MOCK === 'true';

// Axios 实例：baseURL 取 VITE_API_BASE（默认 http://localhost:3000），超时 15s。
const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? 'http://localhost:3000',
  timeout: 15000,
});

// 请求拦截器：从 localStorage 读取 token，存在则附带 Authorization: Bearer。
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token: string | null = localStorage.getItem('token');
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// 响应拦截器：统一解包 ApiResponse。
// code===200 返回 data；code===401 清 token 并跳转 /login；其余码 reject 携带 message 的 Error。
http.interceptors.response.use(
  (response: AxiosResponse<unknown>) => {
    const body = response.data as ApiResponse<unknown>;
    if (body.code === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(new Error(body.message || '未授权'));
    }
    if (body.code !== 200) {
      return Promise.reject(new Error(body.message || '请求失败'));
    }
    response.data = body.data;
    return response;
  },
  (error: unknown) => {
    return Promise.reject(error);
  },
);

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

// mockRequest：业务接口封装统一入口（具体接口的 mock 分支在 P5-3 实现）。
// USE_MOCK 为 true：不发起网络请求，直接调用 resolver（读取 client/mock 数据模块）返回 mock 数据；
// USE_MOCK 为 false：走真实 axios 实例，由响应拦截器统一解包后返回 data。
// 新增可选 data 参数：真实分支把请求体透传给 axios；mock 分支忽略（由 resolver 直接返回数据）。
export async function mockRequest<T>(
  method: HttpMethod,
  urlPattern: string,
  resolver: () => T | Promise<T>,
  data?: unknown,
): Promise<T> {
  if (USE_MOCK) {
    return await resolver();
  }
  const response: AxiosResponse<T> = await http.request<T>({ method, url: urlPattern, data });
  return response.data;
}

export { http, USE_MOCK };
