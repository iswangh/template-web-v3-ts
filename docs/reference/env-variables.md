# 环境变量速查

所有以 `VITE_` 开头的变量可在客户端通过 `import.meta.env` 访问。类型声明见 `src/types/env.d.ts`。

## 全局（`.env`）

| 变量 | 示例值 | 说明 |
|------|--------|------|
| `VITE_APP_NAME` | `template-web-v3-ts` | 应用名称（HTML title、PWA manifest） |
| `VITE_APP_SHORT_NAME` | `template-web` | 应用简称（PWA） |
| `VITE_APP_VERSION` | `1.0.0` | 项目版本（预留，当前未在代码中消费） |
| `VITE_APP_BASE_PUBLIC_PATH` | `/` | 部署基础路径，对应 Vite `base` |

## 按环境（`.env.development` 等）

| 变量 | 类型 | 说明 |
|------|------|------|
| `VITE_APP_ENV` | `development` \| `production` \| `staging` \| `test` | 环境标识 |
| `VITE_API_BASE_URL` | string | API 基础地址，映射为 `config/api.ts` → `BASE_URL` |
| `VITE_SERVER_PORT` | number string | 开发服务器端口 |
| `VITE_SERVER_OPEN` | `true` \| `false` | 启动 dev 时是否打开浏览器 |
| `VITE_USE_MOCK` | `true` \| `false` | 开发模式下是否启用 `vite-plugin-mock` |
| `VITE_BUILD_SOURCEMAP` | `true` \| `false` | 构建是否输出 sourcemap |
| `VITE_BUILD_DROP_CONSOLE` | `true` \| `false` | 构建时是否移除 `console` |
| `VITE_BUILD_DROP_DEBUGGER` | `true` \| `false` | 构建时是否移除 `debugger` |
| `VITE_COOKIE_SECURE` | `true` \| `false` | Cookie `secure` 属性（`utils/cookies.ts`） |

## 各环境默认值摘要

| 变量 | development | test | staging | production |
|------|-------------|------|---------|------------|
| `VITE_USE_MOCK` | `true` | `false` | `false` | `false` |
| `VITE_BUILD_SOURCEMAP` | `true` | `true` | `false` | `false` |
| `VITE_BUILD_DROP_CONSOLE` | `false` | `false` | `true` | `true` |
| `VITE_BUILD_DROP_DEBUGGER` | `false` | `false` | `true` | `true` |
| `VITE_COOKIE_SECURE` | — | — | `false` | `false` |

「—」表示该环境文件中未显式设置，沿用 Vite 默认或未定义行为。

## 使用注意

1. **不要提交敏感信息**（密钥、内网地址等）到版本库；生产密钥应通过 CI/CD 或部署平台注入。
2. 修改 `.env*` 后需**重启** dev server 才能生效。
3. 新增变量时同步更新 `src/types/env.d.ts`，并在 `src/config/` 中封装常量供业务使用。
