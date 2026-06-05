# Template Web V3 TS

基于 pnpm + Vite + TypeScript 的现代化前端项目模板。

## 🚀 快速开始

### 环境要求

- **Node.js**：`^20.19.0` 或 `>=22.12.0`（以 `package.json` → `engines` 为准）；推荐用 Volta 固定版本，项目已配置 **`volta.node: 24.15.0`**
- **包管理器**：支持 pnpm（项目预安装脚本限制），推荐搭配 @antfu/ni 使用（需先全局安装：`npm i -g @antfu/ni`）

### 安装依赖

```bash
# 使用 ni 自动适配包管理器（推荐）
ni

# 若未安装 ni，直接用 pnpm 安装
pnpm install
```

### 开发调试

```bash
# 本地开发（默认 development 环境）
nr dev

# 测试环境开发（test 环境配置）
nr dev:test

# 预发布环境开发（staging 环境配置）
nr dev:staging
```

### 构建部署

```bash
# 生产环境构建（含类型检查）
nr build

# 测试环境构建
nr build:test

# 预发布环境构建
nr build:staging

# 构建后预览
nr preview
```

### 代码质量

```bash
# ESLint 代码检查
nr lint

# ESLint 自动修复
nr lint:fix

# TypeScript 类型检查
nr type-check

# 查看 ESLint 配置详情
nr eslint:inspect
```

### 测试

```bash
# 单元测试（Vitest，watch 模式 — 改代码自动重跑）
nr test:unit

# 单元测试（跑一遍 — CI / 提交前快速自检）
nr test:unit:run

# E2E（Playwright，跑一遍）
nr test:e2e

# 单元 + E2E 全量跑一遍（发版 / CI 门禁）
nr test:run
```

命名约定与脚本说明详见 [docs/testing.md](./docs/testing.md)。

## ✨ 技术特性

### 核心框架

- 🎯 Vue 3 - 渐进式 JavaScript 框架
- 🦾 TypeScript - 类型安全的 JavaScript
- 🏗️ Pinia - Vue 状态管理

### 构建工具

- 📦 pnpm - 高效的 Node.js 包管理器
- ⚡️ Vite - 下一代前端构建工具

### 数据请求

- 🌐 Axios - HTTP 请求库
- 🚀 Alova - 轻量级请求策略库
- 🔄 TanStack Vue Query - 服务端状态管理

### 样式与 UI

样式栈：**UnoCSS 为主，Sass/SCSS 为辅。**

- 🎨 **UnoCSS** — 原子化 CSS，主样式方案
- 💅 **Sass/SCSS** — 组件内使用 `<style lang="scss" scoped>`；`src/assets/styles/variables.scss` 在构建时经 Vite `additionalData` 注入，各组件无需再写 `@import`

### 开发工具

- 🛠️ ESLint - 代码质量检查
- 🐺 Husky - Git hooks
- 📝 Lint-staged - 暂存区文件检查
- 🔧 Commitlint - Git 提交信息规范

### 测试框架

- 🧪 Vitest - 单元测试框架
- 🌐 Playwright - E2E 测试

## 🎯 图标使用

项目通过 unplugin-icons + @iconify-json 生态实现图标自动引入，无需手动注册，直接以组件形式调用。

### 常用图标集示例

Material Design Icons (mdi)：

```vue
<IconMdiHome />    <!-- 主页 -->

<IconMdiUser />    <!-- 用户 -->

<IconMdiSettings /> <!-- 设置 -->
```

Element Plus Icons (ep)：

```vue
<IconEpSearch />   <!-- 搜索 -->

<IconEpEdit />     <!-- 编辑 -->

<IconEpDelete />   <!-- 删除 -->
```

Font Awesome (fa)：

```vue
<IconFaHeart />      <!-- 爱心 -->

<IconFaShareNodes /> <!-- 分享 -->
```

### 使用规则

1. 查找图标：访问 [icones.js.org](https://icones.js.org)，搜索关键词
2. 语法转换：`{前缀}:{图标名}` → `<Icon{前缀大写}{图标名驼峰化} />`

示例：`tabler:mail` → `<IconTablerMail />`

## 📁 项目结构

```

src/
├── api/            # API 接口层
├── assets/         # 静态资源
├── components/     # 公共组件
├── composables/    # 组合式函数
├── config/         # 应用配置
├── constants/      # 常量定义
├── mock/           # 模拟数据
├── router/         # 路由配置
├── stores/         # 状态管理
├── types/          # 类型定义
├── utils/          # 工具函数
├── views/          # 页面组件
├── App.vue         # 根组件
└── main.ts         # 入口文件

e2e/                # Playwright E2E（按业务域命名 *.spec.ts）
```

## ⚠️ 注意事项

### 包管理器

- 项目预安装脚本强制使用 pnpm
- 如需切换包管理器，需修改 `scripts.preinstall` 中的 `only-allow pnpm`

### 开发工具

- `ni/nr` 命令：自动识别项目包管理器，`nr` 对应 `npm run`
- 无需记忆不同包管理器的命令差异

### 代码规范

- 提交信息：遵循 Angular 规范，格式为 `type(scope): message`
- 示例：`feat(home): add banner component`

## 🔧 配置文件

- 构建配置：`vite.config.ts`
- 类型配置：`tsconfig.json`
- 样式引擎：`uno.config.ts`
- 代码规范：`eslint.config.js`
- Git Hooks：`.husky/`
