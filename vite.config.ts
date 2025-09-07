import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    plugins: [
      vue(),
      vueJsx(),
      isDev && vueDevTools(),
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
