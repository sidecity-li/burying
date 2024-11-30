import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import path from "path";

const entry = path.resolve(__dirname, "./src/index.tsx");

// https://vite.dev/config/

export default defineConfig({
  plugins: [
    react(),
  ],
  build: {
    minify: false,
    sourcemap: true,
    lib: {
      entry: entry,
      formats: ["es"],
      fileName: (format, entryName) => `${entryName}.${format}.js`,
    },
    rollupOptions: {
      plugins: [
        getBabelOutputPlugin({
          allowAllFormats: true,
          configFile: path.resolve(__dirname, './babel.config.js')
        }),
      ],
      external: ["react", "react/jsx-runtime"],
      output: {
        dir: "./dist",
      },
    },
  },
});
