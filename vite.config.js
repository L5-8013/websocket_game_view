import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import styleImport, { VantResolve } from "vite-plugin-style-import"
const path = require("path");
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    styleImport({
    resolves: [VantResolve()],
  })],
  base: "./", 
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css:{
    preprocessorOptions:{
      scss:{
        // 自动导入全局样式
        additionalData: "@import './src/assets/scss/base.scss';"
      }
    }
  }
})
