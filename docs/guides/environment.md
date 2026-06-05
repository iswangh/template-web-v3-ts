# 多环境配置

项目通过 Vite 的 [Env 与 Mode](https://cn.vitejs.dev/guide/env-and-mode.html) 机制区分运行环境。

## 环境文件

| 文件 | 对应 mode | 典型用途 |
|------|-----------|----------|
| `.env` | 所有 mode 共享 | 应用名称、版本、公共路径 |
| `.env.development` | `development`（`nr dev` 默认） | 本地开发、Mock、调试选项 |
| `.env.test` | `test`（`nr dev:test` / `nr build:test`） | 测试环境 API |
| `.env.staging` | `staging`（`nr dev:staging` / `nr build:staging`） | 预发布环境 |
| `.env.production` | `production`（`nr build` 默认） | 生产构建 |

变量必须以 `VITE_` 为前缀才能在客户端代码中通过 `import.meta.env` 访问。完整清单见 [reference/env-variables.md](../reference/env-variables.md)。

## 脚本与 mode 对应关系

| 脚本 | Vite mode | 加载的环境文件 |
|------|-----------|----------------|
| `dev` | `development` | `.env` + `.env.development` |
| `dev:test` | `test` | `.env` + `.env.test` |
| `dev:staging` | `staging` | `.env` + `.env.staging` |
| `build` | `production` | `.env` + `.env.production` |
| `build:test` | `test` | `.env` + `.env.test` |
| `build:staging` | `staging` | `.env` + `.env.staging` |

后加载的文件会覆盖先加载的同名字段。

## 在代码中读取配置

业务代码应优先使用 `src/config/` 中的常量，而非直接散落 `import.meta.env`：

```typescript
// src/config/app.ts
export const APP_NAME = import.meta.env.VITE_APP_NAME
export const BASE_PUBLIC_PATH = import.meta.env.VITE_APP_BASE_PUBLIC_PATH

// src/config/api.ts
export const BASE_URL = import.meta.env.VITE_API_BASE_URL
```

类型定义见 `src/types/env.d.ts`。新增环境变量时请同步更新该文件。

## 开发服务器

`vite.config.ts` 读取以下变量控制 dev server：

- `VITE_SERVER_PORT` — 端口（无效值回退 `3000`）
- `VITE_SERVER_OPEN` — 是否自动打开浏览器（`true` / `false`）

## 构建行为

生产构建相关开关（见各 `.env.*`）：

- `VITE_BUILD_SOURCEMAP` — 是否生成 sourcemap
- `VITE_BUILD_DROP_CONSOLE` — 是否移除 `console`
- `VITE_BUILD_DROP_DEBUGGER` — 是否移除 `debugger`

构建产物按 vendor 分包（vue / ui / request / utils），配置见 `vite.config.ts` → `build.rolldownOptions.output.codeSplitting`。

## 新增环境

1. 复制现有 `.env.*` 为新 mode 文件（如 `.env.uat`）
2. 在 `package.json` 增加对应脚本：`vite --mode uat` / `vite build --mode uat`
3. 更新 `src/types/env.d.ts` 中 `VITE_APP_ENV` 联合类型（若使用该字段）
