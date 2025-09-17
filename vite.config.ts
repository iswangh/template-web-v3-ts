import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { visualizer } from 'rollup-plugin-visualizer'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, loadEnv } from 'vite'
import compression from 'vite-plugin-compression'
import { createHtmlPlugin } from 'vite-plugin-html'
import inspect from 'vite-plugin-inspect'
import { viteMockServe } from 'vite-plugin-mock'
import progress from 'vite-plugin-progress'
import { VitePWA } from 'vite-plugin-pwa'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
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
    plugins: [
      vue(),
      vueJsx(),
      UnoCSS(),
      viteMockServe({
        mockPath: 'mock', // 指定mock文件夹路径
        enable: isServe && useMock,
        logger: true, // 在控制台显示请求日志
        watchFiles: true, // 监听mock文件更改
      }),
      // 自动导入插件
      AutoImport({
        // 预设自动导入
        imports: ['vue', 'vue-router', 'pinia', {
          'lodash-es': ['get', 'set', 'cloneDeep', 'omit', 'pick', 'isEmpty', 'debounce', 'throttle', 'once', 'isString', 'isNumber', 'isArray', 'isObject', 'isFunction', ['map', 'lodashMap'], ['filter', 'lodashFilter'], ['find', 'lodashFind'], ['orderBy', 'lodashOrderBy'],
          ],
        }],
        // 自定义自动导入
        dirs: ['./src/apis', './src/composables', './src/stores'],
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
          IconsResolver({
            prefix: 'Icon', // 图标组件前缀
            customCollections: ['user', 'setting'], // 自定义图标集名称
          }),
        ],
      }),
      /**
       * unplugin-icons 插件配置
       * @description 用于自动按需加载海量图标
       * @see https://github.com/antfu/unplugin-icons 插件文档
       * @see https://icones.js.org/ 查看所有可用图标
       * @note 修改 customCollections 配置后，需要删除 src/types/components.d.ts 文件并重启开发服务器
       */
      Icons({
        autoInstall: true,
        compiler: 'vue3',
        jsx: 'react',
        customCollections: {
          user: FileSystemIconLoader('src/assets/svgs/user', svg =>
            svg.replace(/^<svg /, '<svg fill="currentColor" ')),
          setting: FileSystemIconLoader('src/assets/svgs/setting', svg =>
            svg.replace(/^<svg /, '<svg fill="currentColor" ')),
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
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            'lib-vendor': ['lodash-es', 'dayjs'],
            'css-vendor': ['unocss'],
            'icon-vendor': ['unplugin-icons'],
            // 'ui-vendor': [''],
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
