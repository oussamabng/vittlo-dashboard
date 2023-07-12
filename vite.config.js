import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgLoader from "vite-svg-loader";
import vitePluginFaviconsInject from "vite-plugin-favicons-inject";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    react(),
    svgLoader(),
    vitePluginFaviconsInject("./src/assets/favicon.svg"),
  ],
});
