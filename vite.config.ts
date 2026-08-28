import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    exclude: ["@mlc-ai/web-llm"],
  },
  build: {
    cssMinify: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/@mlc-ai/web-llm")) {
            return "web-llm"
          }
          if (id.includes("node_modules/xlsx")) {
            return "xlsx"
          }
          if (id.includes("/src/tia/import/")) {
            return "tia-import"
          }
          if (id.includes("/src/lib/local-ai/") || id.includes("/src/hooks/use-assessment-ai")) {
            return "assessment-ai"
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
