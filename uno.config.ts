import { resolve } from 'node:path'
import process from 'node:process'
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import presetWind3 from '@unocss/preset-wind3'
import transformerCompileClass from '@unocss/transformer-compile-class'
import { defineConfig, presetAttributify, presetIcons, transformerDirectives, transformerVariantGroup } from 'unocss'
import { unoRules, unoShortcuts } from './src/configs'

// 路径解析（集中管理路径，便于维护）
const resolvePath = (relativePath: string) => resolve(__dirname, relativePath)

// 判断当前环境（Vite 会自动注入 NODE_ENV）
const isProduction = process.env.NODE_ENV === 'production'

export default defineConfig({
  presets: [
    // 默认预设（兼容 Tailwind 语法）
    presetWind3(),
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
        local: FileSystemIconLoader(resolvePath('src/assets/svgs'), svg => svg.replace(/^<svg /, '<svg fill="currentColor" '),
        ),
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
