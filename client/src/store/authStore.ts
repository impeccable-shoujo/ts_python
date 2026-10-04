import { create } from 'zustand';
import {
  login as loginApi,
  register as registerApi,
  getMe as getMeApi,
} from '../services/auth.service';
import type { User } from '../types/user.type';

// 登录/注册入参（与 services/auth.service 形参一致；总纲 types 未定义该请求体，本地定义，不与总纲同名类型冲突）。
interface AuthCredentials {
  username: string;
  password: string;
}

interface RegisterCredentials extends AuthCredentials {
  email?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (dto: AuthCredentials) => Promise<void>;
  register: (dto: RegisterCredentials) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  // 登录：调用 service，成功后存 token，并拉取完整用户信息填充 user。
  async login(dto: AuthCredentials): Promise<void> {
    set({ loading: true, error: null });
    try {
      const res = await loginApi(dto);
      set({ token: res.token });
      const user = await getMeApi();
      set({ user, loading: false });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : '登录失败', loading: false });
    }
  },

  // 注册：调用 service，成功后存 token，并拉取完整用户信息填充 user。
  async register(dto: RegisterCredentials): Promise<void> {
    set({ loading: true, error: null });
    try {
      const res = await registerApi(dto);
      set({ token: res.token });
      const user = await getMeApi();
      set({ user, loading: false });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : '注册失败', loading: false });
    }
  },

  // 登出：清空状态并移除 localStorage 中的 token。
  logout(): void {
    localStorage.removeItem('token');
    set({ user: null, token: null, error: null });
  },

  // 拉取当前用户：GET /api/auth/me，填充 user；失败时清空登录态。
  async fetchMe(): Promise<void> {
    set({ loading: true, error: null });
    try {
      const user = await getMeApi();
      set({ user, loading: false });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : '获取用户信息失败', loading: false });
    }
  },
}));

// isLoggedIn 派生：token 存在即视为已登录（供组件选择器使用）。
export const selectIsLoggedIn = (state: AuthState): boolean => state.token !== null;
export const useIsLoggedIn = (): boolean => useAuthStore(selectIsLoggedIn);
