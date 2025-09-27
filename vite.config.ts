import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, "widget/src/index.tsx"),
      name: "LiveChatWidget",
      fileName: () => "livechat-widget.js",
      formats: ["iife"],
    },
    rollupOptions: {
      external: [],
    },
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    minify: true,
  },
});
