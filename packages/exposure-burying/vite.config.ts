import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const entry = path.resolve(__dirname, "./src/index.tsx");

// https://vite.dev/config/

export default defineConfig({
  plugins: [react()],
  build: {
    // 如下是默认值
    // target: "es5",
    minify: false,
    sourcemap: true,
    lib: {
      entry: entry,
      formats: ["es"],
      fileName: (format, entryName) => `${entryName}.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react/jsx-runtime"],
      output: {
        dir: "./exposure-burying/dist",
      },
    },
  },
});
