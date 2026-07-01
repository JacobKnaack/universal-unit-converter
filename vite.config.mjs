// vite.config.js
import { defineConfig } from "vite";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

const ENV = process.env.NODE_ENV;

export default defineConfig({
  publicDir: false,
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./test/setup.js"],
  },
  build: {
    outDir: "dist",
    emptyOutDir: ENV === 'dev' ? false : true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "src/popup/popup.js"),
        options: resolve(__dirname, "src/options/options.js"),
      },
      output: {
        entryFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      }
    }
  },
  plugins: [
    {
      name: "watch-static-files",
      buildStart() {
        this.addWatchFile(resolve(__dirname, "manifest.json"));
        this.addWatchFile(resolve(__dirname, "src/popup/popup.html"));
        this.addWatchFile(resolve(__dirname, "src/options/options.html"));
        this.addWatchFile(resolve(__dirname, "assets/icons/favicon.png"));
        this.addWatchFile(resolve(__dirname, "src/content/style.css"));
      }
    },
    viteStaticCopy({
      targets: [
        { src: "manifest.json", dest: "." },
        { src: "src/popup/popup.html", dest: "." },
        { src: "src/options/options.html", dest: "." },
        { src: "assets/icons/favicon.png", dest: "." },
        { src: "src/content/style.css", dest: "assets" }
      ]
    })
  ]
});
