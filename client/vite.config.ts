import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite 配置：React 插件 + 开发服务器代理（联调时 /api 转发到 NestJS 后端 3000 端口）。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
