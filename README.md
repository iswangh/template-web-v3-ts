# Template Web V3 TS

基于 pnpm + Vite + TypeScript 的现代化前端项目模板。

详细文档见 [`docs/`](./docs/README.md)。

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

开发服务器默认端口由 `.env.development` 中的 `VITE_SERVER_PORT` 控制（当前为 `8080`）。

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

## ✨ 技术特性

### 核心框架

- 🎯 **Vue 3** — Composition API
- 🦾 **TypeScript** — 全链路类型安全
- 🏗️ **Pinia** + **pinia-plugin-persistedstate** — 状态管理与持久化
- 🌍 **vue-i18n** — 国际化（默认 `zh-CN`，见 [`docs/guides/i18n.md`](./docs/guides/i18n.md)）
- 🧩 **Element Plus** — UI 组件库（按需自动导入 + 全量图标注册）

### 构建工具

- 📦 **pnpm** — 包管理
- ⚡️ **Vite 8** — 开发与生产构建
- 📱 **vite-plugin-pwa** — 渐进式 Web 应用
- 🗜️ **vite-plugin-compression** — 生产 gzip 压缩
- 📊 **rollup-plugin-visualizer** — 打包体积分析（`dist/stats.html`）

### 数据请求

项目提供三套 HTTP 客户端，共享拦截器与基础配置（见 [`docs/guides/request.md`](./docs/guides/request.md)）：

- 🌐 **Axios** — `axiosClient`
- 🚀 **Alova** — `alovaClient`（基于 Axios 适配器）
- 🔄 **TanStack Vue Query** — `queryClient`（服务端状态缓存）

### 样式与 UI

样式栈：**UnoCSS 为主，Sass/SCSS 为辅。**

- 🎨 **UnoCSS** — 原子化 CSS（Wind4 预设、属性化模式、图标支持）
- 💅 **Sass/SCSS** — 组件内 `<style lang="scss" scoped>`；`src/assets/styles/variables.scss` 经 Vite `additionalData` 全局注入
- 🎬 **GSAP** — 动画库（按需引入）

### 开发体验

- 🔌 **unplugin-auto-import** — 自动导入 Vue / Router / Pinia / i18n / VueUse / lodash-es / API / composables / stores
- 🧱 **unplugin-vue-components** — `src/components` 自动注册 + Element Plus 按需解析
- 🎯 **unplugin-icons** + **@iconify-json** — 图标按需组件化
- 🧪 **vite-plugin-mock** — 开发环境 Mock（见 [`docs/guides/mock.md`](./docs/guides/mock.md)）
- 🛠️ **vite-plugin-vue-devtools** — 开发调试面板

### 开发工具

- 🛠️ ESLint — 代码质量检查
- 🐺 Husky — Git hooks
- 📝 Lint-staged — 暂存区文件检查
- 🔧 Commitlint — Git 提交信息规范

### 测试框架

- 🧪 Vitest — 单元测试
- 🌐 Playwright — E2E 测试

## 🎯 图标使用

项目通过 **unplugin-icons** + **@iconify-json** 生态实现图标自动引入，无需手动注册，直接以组件形式调用。

### 常用图标集示例

Material Design Icons (mdi)：

```vue
<IconMdiHome />
<IconMdiUser />
<IconMdiSettings />
```

Element Plus Icons (ep)：

```vue
<IconEpSearch />
<IconEpEdit />
<IconEpDelete />
```

### 本地 SVG 图标

`src/assets/svgs/` 下按目录组织，经 Vite 与 UnoCSS 双通道加载：

| 目录 | unplugin-icons 组件 | UnoCSS class |
|------|---------------------|--------------|
| `svgs/user/` | `<IconUserUser />` | `i-local-user` |
| `svgs/setting/` | `<IconSettingSetting />` | `i-local-setting` |

新增自定义图标集时，需同步修改 `vite.config.ts` 与 `uno.config.ts` 中的 `customCollections`；修改后删除 `src/types/components.d.ts` 并重启开发服务器。

### 使用规则

1. 查找图标：访问 [icones.js.org](https://icones.js.org)
2. 语法转换：`{前缀}:{图标名}` → `<Icon{前缀大写}{图标名驼峰化} />`
3. 示例：`tabler:mail` → `<IconTablerMail />`

## 📁 项目结构

```
build/                  # Vite / UnoCSS 构建辅助（lodash 按需列表、SVG loader、UnoCSS rules）
docs/                   # 项目文档（见 docs/README.md）
e2e/                    # Playwright E2E（按业务域命名 *.spec.ts）
src/
├── api/                # API 接口层（自动导入）
├── assets/             # 静态资源（styles、svgs）
├── components/         # 公共组件（自动注册）
│   └── SchemaFormItem/ #  schema 驱动表单项
├── composables/        # 组合式函数（form、interactions；自动导入）
├── config/             # 应用配置（app、api、i18n）
├── constants/          # 常量定义
├── i18n/               # vue-i18n 实例创建
├── locales/            # 语言包（zh-CN、en-US）
├── mock/               # vite-plugin-mock 模拟接口
├── plugins/            # Vue 插件（Element Plus 图标注册等）
├── router/             # 路由（static + whitelist、守卫）
├── stores/             # Pinia 状态（自动导入）
├── tests/              # 测试辅助入口
├── types/              # 全局类型与 auto-import 声明
├── utils/              # 工具（request、cookies、date 等）
├── views/              # 页面（auth、home、error、dev）
├── App.vue
└── main.ts
```

## 📚 文档索引

| 主题 | 文档 |
|------|------|
| 多环境配置 | [guides/environment.md](./docs/guides/environment.md) |
| 环境变量速查 | [reference/env-variables.md](./docs/reference/env-variables.md) |
| 国际化 | [guides/i18n.md](./docs/guides/i18n.md) |
| HTTP 请求 | [guides/request.md](./docs/guides/request.md) |
| 路由与鉴权 | [guides/routing.md](./docs/guides/routing.md) |
| Mock 数据 | [guides/mock.md](./docs/guides/mock.md) |
| 测试约定 | [guides/testing.md](./docs/guides/testing.md) |
| SchemaFormItem 组件 | [components/schema-form-item.md](./docs/components/schema-form-item.md) |
| SchemaFormItem 架构（含 compType 类型维护） | [architecture/schema-form-item.md](./docs/architecture/schema-form-item.md) |

## ⚠️ 注意事项

### 包管理器

- 项目预安装脚本强制使用 pnpm
- 如需切换包管理器，需修改 `scripts.preinstall` 中的 `only-allow pnpm`

### 开发工具

- `ni/nr` 命令：自动识别项目包管理器，`nr` 对应 `npm run`
- 无需记忆不同包管理器的命令差异

### 自动导入

以下目录/库的 API **无需手动 import**（类型声明见 `src/types/auto-imports.d.ts`）：

- Vue 全家桶：`vue`、`vue-router`、`pinia`、`vue-i18n`
- `@vueuse/core`
- `lodash-es`（按需，别名前缀 `_`，配置见 `build/config/lodash.ts`）
- `src/api`、`src/composables`、`src/stores`

### 代码规范

- 提交信息：遵循 Angular 规范，格式为 `type(scope): message`
- 示例：`feat(home): add banner component`

## 🔧 配置文件

| 文件 | 说明 |
|------|------|
| `vite.config.ts` | Vite 构建、插件、分包策略 |
| `uno.config.ts` | UnoCSS 预设与自定义规则 |
| `vitest.config.ts` | 单元测试 |
| `playwright.config.ts` | E2E 测试 |
| `tsconfig*.json` | TypeScript 配置 |
| `eslint.config.js` | ESLint |
| `commitlint.config.js` | 提交信息规范 |
| `.env*` | 环境变量（见 [reference/env-variables.md](./docs/reference/env-variables.md)） |
| `.husky/` | Git Hooks |
