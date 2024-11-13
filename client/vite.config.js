import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import nodePolyfills from 'rollup-plugin-polyfill-node';
import fs from "fs";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), // Automatically polyfill core Node.js modules like `process` and `Buffer`
    nodePolyfills({}),
  ],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      'readable-stream': 'vite-compatible-readable-stream',
    },
  },
  server: {
    https: {
      key: fs.readFileSync(
        path.resolve(__dirname, "../cert/localhost+2-key.pem")
      ),
      cert: fs.readFileSync(path.resolve(__dirname, "../cert/localhost+2.pem")),
    },
    // Optionally specify other server options here
  },
});
