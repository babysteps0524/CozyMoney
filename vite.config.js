import { defineConfig } from "vite";
import UnoCSS from "unocss/vite";

export default defineConfig({
  plugins: [UnoCSS()],

  server: {
    open: true,

    watch: {
      usePolling: true,
    },

    hmr: true,
  },
});
