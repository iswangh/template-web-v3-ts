# 文档索引

本目录按主题组织项目文档。新增文档前请先确认应归入哪一类，避免同一内容多处维护。

## Guides（指南）

面向**全项目通用**的开发约定与操作说明，不绑定单一业务功能。

- **放什么**：测试命名与脚本约定、环境配置、提交规范、协作流程等横切主题；读者是全体开发者。
- **不放什么**：某个功能的 PRD 或端到端故事、单组件 API 手册、架构决策记录（ADR）。

### 文档列表

- [多环境配置](./guides/environment.md)
- [国际化（vue-i18n）](./guides/i18n.md)
- [HTTP 请求层](./guides/request.md)
- [路由与鉴权](./guides/routing.md)
- [Mock 数据](./guides/mock.md)
- [测试约定](./guides/testing.md)

## Architecture（架构）

记录**跨模块、偏长期**的技术设计与决策，说明「为什么这样建」。

- **放什么**：领域模型、类型/映射策略、模块边界、数据流、与代码路径对应的架构说明。
- **不放什么**：逐步操作手册、单功能验收标准、可复用组件的 props/slots 文档。

### 文档列表

- [SchemaFormItem 架构设计](./architecture/schema-form-item.md)
- [useForm 架构设计](./architecture/use-form.md) — `src/composables/form/`
- [useDragPosition 架构设计](./architecture/use-drag-position.md) — `src/composables/interactions/`
- [usePointerCardTilt 架构设计](./architecture/use-pointer-card-tilt.md) — `src/composables/interactions/`

## Components（组件）

**可复用 UI / 逻辑组件**的用法与 API，供在多处引用时查阅。

- **放什么**：组件职责、props / emits / slots、示例代码、与 `src/components` 的对应关系。
- **不放什么**：整页业务流程、全局架构决策、仅在某功能内使用一次的私有实现细节。

### 文档列表

- [SchemaFormItem](./components/schema-form-item.md)

## Reference（参考）

**查阅型**速查表与外部约定汇总，强调「查得到」而非「讲清楚故事」。

- **放什么**：错误码表、环境变量清单、第三方 SDK 配置片段、命名对照表。
- **不放什么**：长篇教程、功能需求、需要随版本迭代的实现说明（应放 guides / features / architecture）。

### 文档列表

- [环境变量速查](./reference/env-variables.md)

## Features（功能）

按**单个业务或产品功能**归档「需求 → 实现 → 测试 → 使用」等多篇文档。

- **目录**：`docs/features/<feature-name>/`（`<feature-name>` 用 kebab-case，与功能域或路由模块对应）
- **何时使用**：该功能需要 PRD 摘要、实现映射、专项测试说明、业务/用户手册等多篇文档，且不宜拆散到 guides / architecture 时
- **建议文件名**（可选模板，按需创建，不必一次写全）：
  - `requirements.md` — 需求与验收标准（PRD 摘要）
  - `implementation.md` — 实现说明、与代码路径对应
  - `testing.md` — 该功能的测试范围与用例说明（专项；通用测试约定仍见 [guides/testing.md](./guides/testing.md)）
  - `manual.md` — 面向业务/用户的使用说明
- **与 architecture / components 的边界**：
  - **architecture** — 跨功能的架构决策、类型策略、模块划分
  - **components** — 可复用组件的 API 与示例
  - **features** — 某一功能的端到端故事（从需求到上线、从页面到接口的完整链路）

### 文档列表

> 待补充
