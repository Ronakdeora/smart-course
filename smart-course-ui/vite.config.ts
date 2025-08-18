import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173, //self port
    proxy: {
      "/api": {
        target: "http://localhost:8080", // gateway
        changeOrigin: true,
        secure: false, // if the target is https, set this to true
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
