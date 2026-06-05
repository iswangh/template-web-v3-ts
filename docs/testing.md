# 测试约定

本文档说明本项目的单元测试与 E2E 测试的文件命名、目录约定，以及相关 npm 脚本的用途。

## 单元测试（Vitest）

### 文件位置与命名

- **co-locate**：测试文件与源文件放在**同一目录**。
- **约定后缀**：统一使用 `*.spec.ts`（或 `*.spec.tsx`，若源文件为 TSX）。
- **示例**：`useForm.ts` 对应 `useForm.spec.ts`。

### 配置层兼容说明

Vitest 与 TypeScript 配置会同时匹配 `*.test.ts` 与 `*.spec.ts`，以便兼容历史或外部示例。**团队约定仅使用 `.spec`；新增用例请勿使用 `.test` 后缀。**

相关配置：

| 文件 | 作用 |
|------|------|
| `vitest.config.ts` | `include: src/**/*.{test,spec}.{ts,tsx}`；`exclude` 含 `e2e/**` |
| `tsconfig.app.json` | 应用构建时排除 `src/**/*.{test,spec}.{ts,tsx}` |
| `tsconfig.vitest.json` | 单测类型检查时仅包含 `src/**/*.{test,spec}.{ts,tsx}` |

## E2E 测试（Playwright）

- **目录**：`e2e/`
- **命名**：按业务域划分，`e2e/<domain>.spec.ts`
- **示例**：`e2e/auth.spec.ts`、`e2e/schema-form-item.spec.ts`

E2E 由 Playwright 独立运行，不在 Vitest 的 `include` 范围内。

## 脚本说明

| 脚本 | 命令 | 说明 |
|------|------|------|
| `test:unit` | `vitest` | 单元测试 **watch 模式**：监听文件变更并自动重跑，适合本地开发 |
| `test:unit:run` | `vitest run` | 单元测试 **跑一遍**：无 watch，适合 CI 或提交前快速自检 |
| `test:e2e` | `playwright test` | **E2E 跑一遍**：浏览器端到端测试 |
| `test:run` | `test:unit:run` + `test:e2e` | **全量跑一遍**：单元 + E2E，适合发版或 CI 门禁 |
