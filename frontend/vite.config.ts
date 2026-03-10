import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // All request starting with /api will be redirected to NestJS
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // Delete the /api prefix before sending it to the backend 
        rewrite: (path) => path.replace(/^\/api/, "")
      },
    }
  }
});
