/**
 * @file Vitest 测试配置文件
 *
 * 基于 Vitest 的单元测试配置，继承 Vite 配置，提供完整的测试环境支持。
 * 配置了测试环境、排除规则等核心功能，确保测试能够正常运行。
 *
 * @see {@link https://vitest.dev/ Vitest 官方网站}
 * @see {@link https://cn.vitest.dev/ Vitest 中文文档}
 */

import { fileURLToPath } from 'node:url'
import { configDefaults, defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default defineConfig((configEnv) => {
  return mergeConfig(
    viteConfig(configEnv),
    {
      test: {
        environment: 'jsdom',
        exclude: [...configDefaults.exclude, 'e2e/**'],
        root: fileURLToPath(new URL('./', import.meta.url)),
      },
    },
  )
},
)
