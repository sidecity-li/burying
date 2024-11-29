import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/

export default defineConfig(() => {
  const entry = path.resolve(__dirname, "./src/index.tsx");
  return {
    mode: "production",
    build: {
      // 如下是默认值
      // target: "modules",
      minify: false,
      lib: {
        entry: entry,
        formats: ["es"],
        fileName: (format, entryName) => `${entryName}.${format}.js`,
      },
      rollupOptions: {
        external: ["react", "react/jsx-runtime"],
        output: {
          dir: "../../exposure-burying/dist",
          sourcemap: true,
        },
        plugins: [react()],
      },
    },
  };
});
