/**
 * @file Vite 构建配置文件
 *
 * 基于 Vite 的前端项目构建配置，集成了 Vue 3、TypeScript、UnoCSS、Element Plus 等核心功能，
 * 支持自动导入、组件自动注册、代码分割、资源压缩等优化策略，提供完整的开发和生产环境配置。
 *
 * @see {@link https://vite.dev/ Vite 官方网站}
 * @see {@link https://cn.vitejs.dev/ Vite 中文文档}
 */

import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'
import { ElementPlusKitResolver } from '@iswangh/element-plus-kit/resolver'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { visualizer } from 'rollup-plugin-visualizer'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, loadEnv } from 'vite'
import compression from 'vite-plugin-compression'
import { createHtmlPlugin } from 'vite-plugin-html'
import inspect from 'vite-plugin-inspect'
import { viteMockServe } from 'vite-plugin-mock'
import progress from 'vite-plugin-progress'
import { VitePWA } from 'vite-plugin-pwa'
import ViteRestart from 'vite-plugin-restart'
import vueDevTools from 'vite-plugin-vue-devtools'
import { createSvgLoader, lodashImports } from './build'

export default defineConfig(({ mode, command }) => {
  const isServe = command === 'serve'
  const isBuild = command === 'build'

  const env = loadEnv(mode, process.cwd(), '')

  // 处理环境变量
  const dropConsole = env.VITE_BUILD_DROP_CONSOLE === 'true'
  const dropDebugger = env.VITE_BUILD_DROP_DEBUGGER === 'true'
  const sourcemap = env.VITE_BUILD_SOURCEMAP === 'true'
  const useMock = env.VITE_USE_MOCK === 'true'
  const serverOpen = isServe && env.VITE_SERVER_OPEN === 'true'
  const serverPort = (() => {
    const port = Number.parseInt(env.VITE_SERVER_PORT, 10)
    return Number.isNaN(port) || port < 1 || port > 65535 ? 3000 : port
  })()

  return {
    base: env.VITE_APP_BASE_PUBLIC_PATH ?? '/',
    plugins: [
      vue(),
      vueJsx(),
      UnoCSS(),
      viteMockServe({
        mockPath: 'src/mock', // 指定mock文件夹路径
        enable: isServe && useMock,
        logger: true, // 在控制台显示请求日志
        watchFiles: true, // 监听mock文件更改
      }),
      // 自动导入插件
      AutoImport({
        // 预设自动导入
        imports: ['vue', 'vue-router', 'pinia', '@vueuse/core', { 'lodash-es': lodashImports }],
        // 自定义自动导入
        dirs: ['./src/apis', './src/composables', './src/stores'],
        // 生成对应的 .d.ts 文件
        dts: './src/types/auto-imports.d.ts',
        // 解析器（如果使用 UI 组件库）
        resolvers: [ElementPlusResolver(), ElementPlusKitResolver()],
      }),
      // 自动注册组件
      Components({
        // 指定组件位置
        dirs: ['src/components'],
        // 生成对应的 .d.ts 文件
        dts: './src/types/components.d.ts',
        // 解析器（如果使用 UI 组件库）
        resolvers: [
          ElementPlusResolver(),
          ElementPlusKitResolver(),
          IconsResolver({
            prefix: 'Icon', // 图标组件前缀
            customCollections: ['user', 'setting'], // 自定义图标集名称
          }),
        ],
      }),
      /**
       * unplugin-icons 插件配置
       *
       * 用于自动按需加载海量图标
       *
       * @see https://github.com/antfu/unplugin-icons 插件文档
       * @see https://icones.js.org/ 查看所有可用图标
       * @note 修改 customCollections 配置后，需要删除 src/types/components.d.ts 文件并重启开发服务器
       */
      Icons({
        autoInstall: true,
        compiler: 'vue3',
        jsx: 'react',
        customCollections: {
          user: createSvgLoader('src/assets/svgs/user'),
          setting: createSvgLoader('src/assets/svgs/setting'),
        },
      }),
      createHtmlPlugin({
        minify: isBuild,
        inject: {
          data: {
            title: env.VITE_APP_NAME || '',
          },
        },
      }),
      isServe && vueDevTools(),
      // 监听文件变化并重启开发服务器
      isServe && ViteRestart({
        restart: [
          'vite.config.*',
          'uno.config.*',
          'eslint.config.*',
        ],
      }),
      // 用于调试和分析 Vite 构建过程的工具插件
      isServe && inspect(),
      // 生产环境资源压缩插件（gzip压缩）
      isBuild && compression({
        threshold: 10240, // 只压缩大于10KB的文件
      }),
      // 生产环境构建进度条显示
      isBuild && progress(),
      // 生产环境PWA支持（渐进式Web应用）
      VitePWA({
        registerType: 'autoUpdate', // 自动更新模式
        manifest: {
          name: env.VITE_APP_NAME, // 应用名称
          short_name: env.VITE_APP_SHORT_NAME, // 应用简称
          theme_color: '#ffffff', // 主题颜色
          background_color: '#ffffff', // 背景颜色
          display: 'standalone', // 显示模式（独立应用）
          start_url: '/', // 应用启动路径
        },
      }),
      // 打包分析工具
      isBuild && visualizer({
        filename: 'dist/stats.html',
        open: true, // 打包完成后自动在浏览器打开分析报告
        gzipSize: true, // 显示各模块 gzip 压缩后的体积
        brotliSize: true, // 显示各模块 brotli 压缩后的体积
        template: 'treemap', // 可选：sunburst, treemap, network
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        '~': fileURLToPath(new URL('./', import.meta.url)),
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/styles/variables.scss" as *;', // 样式变量全局混入（自动导入）
        },
      },
    },
    server: {
      open: serverOpen,
      port: serverPort,
      host: true,
    },
    build: {
      sourcemap,
      minify: isBuild ? 'esbuild' : false,
      rollupOptions: {
        output: {
          // js 打包位置
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          // 其他资源保持原有目录结构
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia', 'pinia-plugin-persistedstate'],
            'request-vendor': ['axios', 'alova', '@alova/adapter-axios', '@tanstack/vue-query'],
            'utils-vendor': ['lodash-es', 'dayjs', '@vueuse/core'],
            'ui-vendor': ['unplugin-icons', 'unocss', 'element-plus', '@element-plus/icons-vue', '@iswangh/element-plus-kit'],
          },
        },
      },
    },
    esbuild: {
      drop: isBuild
        ? [...(dropConsole ? ['console'] : []), ...(dropDebugger ? ['debugger'] : [])] as ('console' | 'debugger')[]
        : [],
    },
  }
})
