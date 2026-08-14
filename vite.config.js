import { defineConfig } from "vite";
import UnoCSS from "unocss/vite";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");

export default defineConfig({
  plugins: [UnoCSS()],

  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        stock: resolve(__dirname, "pages/stock.html"),
        realestate: resolve(__dirname, "pages/realestate.html"),
        taxSaving: resolve(__dirname, "pages/taxSaving.html"),
        insurance: resolve(__dirname, "pages/insurance.html"),
        computertax: resolve(__dirname, "pages/computertax.html"),
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
