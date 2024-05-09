import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // optimizeDeps: {
  //   esbuildOptions: {
  //     loader: {
  //       ".txt": "text",
  //       ".html": "text",
  //       ".js": "text",
  //       ".ts": "text",
  //     },
  //   },
  // },
})
