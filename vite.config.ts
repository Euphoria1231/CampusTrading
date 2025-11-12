import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import process from 'process';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  
  // 添加调试日志
  console.log('当前环境变量 VITE_API_FULL_URL:', env.VITE_API_FULL_URL);
  
  return {
    plugins: [react(), svgr()],
    server: {
      open: true,
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_FULL_URL || 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
          // 添加路径重写规则（如果需要）
          rewrite: (path) => path.replace(/^\/api/, '/api'),
          // 增强代理日志
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('代理错误:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('发送代理请求到目标服务器:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('收到目标服务器响应:', proxyRes.statusCode, req.url);
            });
          }
        }
      }
    },
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            hack: `true; @import (reference) "${path.resolve(__dirname, "src/assets/styles/base.less")}";`,
          },
          javascriptEnabled: true,
        }
      }
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src")
      }
    },
    build: {
      assetsInclude: ['**/*.png', '**/*.jpg', '**/*.svg'],
      sourcemap: false
    }
  }
});