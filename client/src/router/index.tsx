import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import TodayReviewPage from '../pages/TodayReviewPage';
import CardLibraryPage from '../pages/CardLibraryPage';
import TagManagePage from '../pages/TagManagePage';
import StatsPage from '../pages/StatsPage';
import AuthGuard from './AuthGuard';
import AppLayout from '../components/layout/AppLayout';

// 路由层：仅做路径映射与守卫装配，不含业务逻辑与接口调用。
const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    // 四个业务路由统一包裹在 AuthGuard 内，并共享左侧导航布局。
    path: '/',
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/today" replace /> },
      { path: 'today', element: <TodayReviewPage /> },
      { path: 'cards', element: <CardLibraryPage /> },
      { path: 'tags', element: <TagManagePage /> },
      { path: 'stats', element: <StatsPage /> },
    ],
  },
]);

export default router;
