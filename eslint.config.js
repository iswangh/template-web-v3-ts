import antfu from '@antfu/eslint-config'

export default antfu(
  {
    // 语言和框架支持
    vue: true, // Vue 支持
    typescript: true, // TypeScript 支持
    jsx: true, // JSX 支持
  },
  {
    // 插件支持
    plugins: [],
  },
  {
    // 规则覆盖与自定义
    rules: {
      'no-undef': 'off', // 关闭未定义变量检查，避免Vue模板变量报错
      'no-unused-vars': 'off', // 关闭原生未使用变量检查，由TS规则处理
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'import', next: '*' }, // import 语句后需要空行
        { blankLine: 'never', prev: '*', next: 'import' }, // 禁止 import 前有空行
      ],

      // Vue 特定规则
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

      // TypeScript 特定规则
      '@typescript-eslint/no-explicit-any': 'warn', // 允许使用 any 但不推荐，会警告
      '@typescript-eslint/no-empty-interface': 'warn', // 警告空接口
      '@typescript-eslint/explicit-module-boundary-types': 'off', // 不强制要求函数返回类型
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true }, // 允许短路运算符和三元运算符
      ],
    },
  },
  {
    // 文件类型特定配置
    files: ['**/*.vue'],
    rules: {
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
      'node_modules/',
      '.bun/',
      // '**/*.config.*',
      // '**/__tests__/**',
      // '**/*.test.*',
      // '**/*.spec.*',
      // '**/*.d.ts',
      'coverage/',
      '**/.output/',
      '**/.nuxt/',
      '**/.vue/',
      '**/.vite/',
    ],
  },
)
