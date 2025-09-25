/**
 * @file ESLint 配置文件
 * @description 基于 @antfu/eslint-config 的代码规范配置，集成了 Vue、TypeScript 和 JSX 支持，
 *              统一项目代码风格，提高代码质量和可维护性
 * @see https://eslint.org/
 * @see https://github.com/antfu/eslint-config
 */

import antfu from '@antfu/eslint-config'
import unocss from '@unocss/eslint-plugin'
import playwright from 'eslint-plugin-playwright'

export default antfu(
  {
    // 语言和框架支持
    vue: true, // Vue 支持
    typescript: true, // TypeScript 支持
    jsx: true, // JSX 支持
    formatters: {
      css: true,
    },
    stylistic: {
      printWidth: 100, // 定义单行最大长度
    },
  },
  { plugins: { playwright } },
  {
    plugins: { unocss },
    rules: {
      // 启用 UnoCSS 相关规则
      'unocss/order': 'warn', // 类名排序
      'unocss/order-attributify': 'warn', // 属性化模式排序
      'unocss/blocklist': 'error', // 禁止使用的类名
    },
  },
  {
    // 对 antfu 预设规则的覆盖
    rules: {
      'antfu/top-level-function': 'off', // 允许使用箭头函数声明顶级函数
    },
  },
  {
    // 自定义 ESLint 规则
    rules: {
      'no-undef': 'off', // 关闭未定义变量检查，避免Vue模板变量报错
      'no-unused-vars': 'off', // 关闭原生未使用变量检查，由TS规则处理
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // 代码风格
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'import', next: '*' }, // import 语句后需要空行
        { blankLine: 'never', prev: '*', next: 'import' }, // 禁止 import 前有空行
      ],

      // TypeScript 特定规则
      '@typescript-eslint/no-explicit-any': 'warn', // 允许使用 any 但不推荐，会警告
      '@typescript-eslint/no-empty-interface': ['warn', { allowSingleExtends: true }], // 允许接口定义为空，但会警告，继承不会
      '@typescript-eslint/explicit-module-boundary-types': 'off', // 不强制要求函数返回类型
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true }, // 允许短路运算符和三元运算符
      ],
      '@typescript-eslint/no-non-null-assertion': 'off', // 允许 TypeScript 中使用更简洁的非空断言（!. 代替繁琐的类型守卫）
    },
  },
  {
    // 文件类型特定配置
    files: ['**/*.vue'],
    rules: {
      'vue/no-v-html': 'off', // 允许使用 v-html,需要注意 XSS 安全
      'vue/multi-word-component-names': 'off', // 允许使用单个单词的组件名称
      'vue/singleline-html-element-content-newline': 'off', // 单行元素不换行

      'vue/html-self-closing': ['error', {
        html: {
          void: 'always', // void 元素使用自闭合 (<img/>)
          normal: 'always', // 普通元素如果无内容也使用自闭合 (<div/>)
          component: 'always', // 组件使用自闭合 (<my-component/>)
        },
      }],

      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }], // 强制 SFC 块顺序: script → template → style
      'vue/block-lang': ['error', { script: { lang: 'ts' } }], // 块语言限制
    },
  },
  {
    // 忽略文件配置
    ignores: [
      'dist/',
      'build/',
      'output/',
      '**/.output/',
      '**/.nuxt/',
      '**/.vite/',
      'node_modules/',
      '.bun/',
      '.pnpm-debug.log',
      'yarn-error.log',
      'coverage/',
      'temp/',
      'tmp/',
      'src/types/generated/',
      '**/*.generated.d.ts',
    ],
  },
)
