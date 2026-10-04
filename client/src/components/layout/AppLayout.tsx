import type { ReactElement } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import styles from './AppLayout.module.css';

interface NavItem {
  to: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/today', label: '今日复习' },
  { to: '/cards', label: '卡片库' },
  { to: '/tags', label: '标签' },
  { to: '/stats', label: '统计' },
];

// 布局外壳：左侧导航 + 右侧内容区；导航高亮由 useLocation 比对当前路径决定。
function AppLayout(): ReactElement {
  const location = useLocation();
  return (
    <div className={styles.shell}>
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={active ? styles.navActive : styles.navItem}
            >
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
