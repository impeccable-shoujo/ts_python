import type { ReactElement } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router';

// 入口仅挂载路由，createBrowserRouter 已自带 history 管理，无需再包 BrowserRouter。
function App(): ReactElement {
  return <RouterProvider router={router} />;
}

export default App;
