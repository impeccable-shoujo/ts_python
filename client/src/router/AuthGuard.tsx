import type { ReactElement, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// 权限守卫：渲染期读取 token，无 token 即重定向 /login（不使用 useEffect，避免异步时序导致闪烁）。
function AuthGuard({ children }: { children: ReactNode }): ReactElement {
  const token = useAuthStore((s) => s.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default AuthGuard;
