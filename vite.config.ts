import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // 로컬에서 /api 는 원격 Spring Boot로 넘긴다. 로컬 서버를 쓸 때는 .env의 VITE_API_PROXY_TARGET을 바꾼다.
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || "http://3.39.133.123:8080";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
