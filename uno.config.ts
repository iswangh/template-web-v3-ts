/**
 * @file UnoCSS 样式引擎配置文件
 *
 * 基于 UnoCSS 的原子化 CSS 引擎配置，集成了 Wind4 预设、属性化模式、图标支持等核心功能，
 * 支持自定义规则、快捷方式、指令转换等扩展能力，提供高效的样式开发体验。
 *
 * @see {@link https://unocss.dev/ UnoCSS 官方网站}
 * @see {@link https://unocss.dev/interactive/ UnoCSS 交互式文档}
 */

import { resolve } from 'node:path'
import process from 'node:process'
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import presetWind4 from '@unocss/preset-wind4'
import transformerCompileClass from '@unocss/transformer-compile-class'
import { defineConfig, presetAttributify, presetIcons, transformerDirectives, transformerVariantGroup } from 'unocss'
import { unoRules, unoShortcuts } from './build'

// 路径解析（集中管理路径，便于维护）
const resolvePath = (relativePath: string) => resolve(__dirname, relativePath)

// 判断当前环境（Vite 会自动注入 NODE_ENV）
const isProduction = process.env.NODE_ENV === 'production'

export default defineConfig({
  presets: [
    presetWind4(),
    // 属性化预设
    presetAttributify({
      prefix: 'un-', // 添加前缀避免与原生属性冲突
      prefixedOnly: false, // 同时支持带前缀和不带前缀的属性
    }),
    // 图标支持
    presetIcons({
      scale: 1.2, // 图标大小
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
        'flex-shrink': '0', // 防止图标在 flex 布局中被压缩
      },
      collections: {
        // 本地自定义图标集
        local: FileSystemIconLoader(resolvePath('src/assets/svgs'), svg => svg.replace(/^<svg /, '<svg fill="currentColor" ')),
      },
    }),
  ],
  transformers: [
    transformerDirectives(), // 支持 @apply, @screen 等指令
    transformerVariantGroup(), // 支持分组语法：hover:(bg-blue-500 text-white)
    ...(isProduction ? [transformerCompileClass()] : []), // 压缩类名,仅在生产环境生效
  ],
  rules: unoRules,
  shortcuts: unoShortcuts,
  theme: {},
  safelist: [],
})
