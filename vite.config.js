import { defineConfig } from "vite";
import UnoCSS from "unocss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [UnoCSS()],

  build: {
    rollupOptions: {
      input: {
        main: resolve("index.html"),
        stock: resolve("pages/stock.html"),
        realestate: resolve("pages/realestate.html"),
        taxSaving: resolve("pages/taxSaving.html"),
        insurance: resolve("pages/insurance.html"),
        computertax: resolve("pages/computertax.html"),
        privacy: resolve("pages/privacy.html"),
      },
    },
  },

  server: {
    open: true,

    watch: {
      usePolling: true,
    },

    hmr: true,
  },
});
