/**
 * @file Vitest 单元测试配置文件
 *
 * 继承 vite.config.ts（别名、插件、自动导入等与开发/构建一致），仅追加 test 段。
 * 用例约定见 docs/testing.md；E2E 由 Playwright 负责，不在此运行。
 *
 * @see {@link https://vitest.dev/ Vitest 官方网站}
 * @see {@link https://cn.vitest.dev/ Vitest 中文文档}
 */

import { fileURLToPath } from 'node:url'
import { configDefaults, defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default defineConfig((configEnv) => {
  /** 合并 Vite 配置，使 @ 别名、UnoCSS、auto-import 等在测试中可用 */
  return mergeConfig(
    viteConfig(configEnv),
    {
      test: {
        /** 模拟浏览器 DOM；适合 composable、工具函数及后续组件单测 */
        environment: 'jsdom',
        /** 扫描 src 下 *.spec / *.test（ts/tsx），不含 e2e；配置兼容两种后缀，团队约定仅用 .spec */
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        /** 保留 Vitest 默认排除项，并排除 Playwright 的 e2e 目录 */
        exclude: [...configDefaults.exclude, 'e2e/**'],
        /** 没有任何匹配用例时失败，避免 CI 漏写测试仍显示通过 */
        passWithNoTests: false,
        /** 测试根目录为项目根，与 vite.config、tsconfig 路径一致 */
        root: fileURLToPath(new URL('./', import.meta.url)),
      },
    },
  )
},
)
