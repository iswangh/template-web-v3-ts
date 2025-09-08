import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import compression from 'vite-plugin-compression'
import inspect from 'vite-plugin-inspect'
import progress from 'vite-plugin-progress'
import { VitePWA } from 'vite-plugin-pwa'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    plugins: [
      vue(),
      vueJsx(),
      // 自动导入插件
      AutoImport({
      // 预设自动导入
        imports: ['vue', 'vue-router', 'pinia'],
        // 自定义自动导入
        dirs: ['./src/apis', './src/composables', './src/stores', './src/utils'],
        // 生成对应的 .d.ts 文件
        dts: './src/types/auto-imports.d.ts',
        // 解析器（如果使用 UI 组件库）
        resolvers: [
        // 示例：ElementPlusResolver()
        ],
      }),
      // 自动注册组件
      Components({
      // 指定组件位置
        dirs: ['src/components'],
        // 生成对应的 .d.ts 文件
        dts: './src/types/components.d.ts',
        // 解析器（如果使用 UI 组件库）
        resolvers: [
        // 示例：ElementPlusResolver()
        ],
      }),
      isDev && vueDevTools(),
      // 用于调试和分析 Vite 构建过程的工具插件
      isDev && inspect(),
      // 生产环境资源压缩插件（gzip压缩）
      !isDev && compression({
        threshold: 10240, // 只压缩大于10KB的文件
      }),
      // 生产环境构建进度条显示
      !isDev && progress(),
      // 生产环境PWA支持（渐进式Web应用）
      VitePWA({
        registerType: 'autoUpdate', // 自动更新模式
        manifest: {
          name: 'template-web-v3-ts', // 应用名称
          short_name: 'template-web', // 应用简称
          theme_color: '#ffffff', // 主题颜色
          background_color: '#ffffff', // 背景颜色
          display: 'standalone', // 显示模式（独立应用）
          start_url: '/', // 应用启动路径
        },
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      open: true,
      port: 8080,
    },
    esbuild: { drop: isDev ? [] : ['console', 'debugger'] },
    build: {
      sourcemap: isDev,
      minify: isDev ? false : 'esbuild',
      rollupOptions: {
        output: {
        // js 打包位置
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          // 其他资源保持原有目录结构
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
          manualChunks: {
            vue: ['vue'],
            router: ['vue-router'],
            pinia: ['pinia'],
          },
        },
      },
    },
  }
})
