import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  cacheDir: resolve(process.cwd(), "node_modules/.vite/motion-index"),
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(process.cwd(), "index.html"),
    },
  },
});
