import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false, // CRITICAL: Do not wipe the dist folder! We want to add to it.
    lib: {
      entry: resolve(__dirname, "src/content/index.js"),
      name: "ContentScript",
      formats: ["iife"],
      fileName: () => "assets/content.js"
    }
  }
});