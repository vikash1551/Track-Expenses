import { defineConfig } from "@lovable.dev/vite-tanstack-config";


export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    server: { 
      preset: "vercel-edge" 
    },
  },
  vite: {
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:8080",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  },
});
