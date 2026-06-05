# useDragPosition 架构设计

本文说明 `src/composables/interactions/useDragPosition.ts` 的设计：基于指针拖动的位移管理、边界约束、可选持久化，以及与 GSAP / VueUse 的分工。

## 设计目标与职责边界

### 目标

- 在 **指定容器内** 拖动目标元素，用 **translate（GSAP `x` / `y`）** 更新位置，而非改 `top` / `left`。
- 支持 **session / localStorage** 可选持久化，便于认证页等「卡片位置记忆」场景。
- 通过 **忽略选择器** 保留输入框、按钮、链接等子元素的原生交互（点击、选中、右键菜单）。

### 负责

| 能力 | 说明 |
|------|------|
| 拖动位移 | 指针 delta → 更新 `position` 并 `gsap.set` 到 `targetRef` |
| 容器边界 | 委托 `@vueuse/core` `useDraggable` 的 `containerElement` |
| 拖动状态 | 暴露 `isDragging`（来自 VueUse） |
| 位置持久化 | 传入 `storageKey` 时在 `onEnd` / `onUnmounted` 写入 storage |
| 恢复位置 | `onMounted` 从 storage 读取或使用 `defaultPosition` |
| 交互过滤 | 右键（button === 2）不启动拖动；命中 `ignoreDragSelector` 不启动 |

### 不负责

| 能力 | 说明 |
|------|------|
| 拖动手柄 UI | 不区分 header / body；由 `ignoreDragSelector` 间接限定可拖区域 |
| 多指 / 触摸专用逻辑 | 依赖 Pointer 事件与 VueUse 默认行为 |
| 与倾斜动效协调 | 与 `usePointerCardTilt` 独立；登录页将拖动壳与倾斜内层分离 DOM |
| SSR 首屏位置 | `window` 不可用时读写 storage 均回退为 `defaultPosition` |

## 模块结构

```
src/composables/interactions/
├── useDragPosition.ts    # 实现
└── index.ts              # 再导出
```

全局 auto-import，选项类型 `UseDragPositionOptions` 见 `auto-imports.d.ts`。

## API

### UseDragPositionOptions

| 选项 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `containerRef` | `Ref<HTMLElement \| undefined>` | **必填** | 拖动边界容器 |
| `targetRef` | `Ref<HTMLElement \| undefined>` | **必填** | 被拖动元素（应用 transform 的目标） |
| `storageKey` | `string` | 无 | 传入则启用读写 storage；不传则仅内存位置 |
| `storage` | `'session' \| 'local'` | `'session'` | 仅在有 `storageKey` 时生效 |
| `defaultPosition` | `{ x, y }` | `{ x: 0, y: 0 }` | 无缓存或解析失败时的初始位置 |
| `ignoreDragSelector` | `string` | 见下文 | 命中时不启动拖动 |

默认 `ignoreDragSelector`：

```
input, textarea, select, button, a, [role="button"],
.el-input__wrapper, .el-input__inner,
p, span, h1–h6, label
```

### 返回值

| 成员 | 类型 | 说明 |
|------|------|------|
| `isDragging` | `Ref<boolean>` | 是否正在拖动 |
| `position` | `Ref<{ x: number; y: number }>` | 当前逻辑坐标（与 GSAP translate 一致） |
| `persistCurrentPosition` | `() => void` | 手动写入 storage（需 `storageKey`） |

## 行为与生命周期

### 数据流

```
onMounted
    │
    ├─ storageKey ? readPositionFromStorage : defaultPosition
    │
    └─ applyPosition → gsap.set(target, { x, y, force3D: true })

useDraggable(targetRef, { containerElement: containerRef })
    │
    onStart
    │   ├─ 右键 → return false
    │   ├─ closest(ignoreDragSelector) → return false
    │   └─ 记录 pointer 起点 + 当前 translate 起点
    │
    onMove
    │   └─ position = startTranslate + delta → applyPosition
    │
    onEnd / onUnmounted
        └─ persistCurrentPosition（有 storageKey 时）
```

### 持久化格式

- Key：`storageKey` 字符串（如 `'auth:login:card-position'`）。
- Value：`JSON.stringify({ x: number, y: number })`。
- 解析失败或非数字字段 → 回退 `defaultPosition`。
- 写入失败（隐私模式、配额等）→ 静默忽略，不阻断交互。

### 与 usePointerCardTilt 的组合模式

认证页（`login` / `register` / `forgot-password`）典型结构：

```
外层 dragCardRef（useDragPosition 目标，负责位移）
  └─ 内层 tiltCardRef（usePointerCardTilt，负责 3D 倾斜）
        └─ 表单内容
```

拖动 transform 与倾斜 transform 作用于 **不同 DOM 节点**，避免 GSAP 属性互相覆盖。

### 样式配合

- 页面可为 `isDragging` 增加 class（如 `auth-page__card--dragging`）以调整光标或阴影。
- `preventDefault: false`，保留文本选择等行为；忽略选择器进一步缩小可拖区域。

## 依赖

| 依赖 | 用途 |
|------|------|
| `@vueuse/core` `useDraggable` | 指针拖动、容器约束、`isDragging` |
| `gsap` | 对 `targetRef` 设置 `x` / `y` transform（`force3D: true`） |
| Vue `ref` / `onMounted` / `onUnmounted` | 生命周期与状态 |

## 测试说明

| 层级 | 路径 | 说明 |
|------|------|------|
| 单元测试 | — | **暂无**；storage 解析、ignore 规则、边界 clamp 适合后续 `useDragPosition.spec.ts` |
| E2E | `e2e/auth.spec.ts` | 登录/注册页间接覆盖拖动与持久化（浏览器级） |

新增 composable 行为时，优先补 **单元测试** mock `useDraggable` 与 `gsap.set`；关键用户路径保留 **E2E** 冒烟。

## 已知限制

| 项 | 说明 |
|----|------|
| 无 `useDragPosition.spec.ts` | 回归依赖 E2E 或人工验证 |
| 忽略列表维护成本 | 新 UI 组件若需「内部可点但外壳可拖」，需扩展 selector |
| 仅 translate | 不改变文档流布局；容器尺寸变化时不自动重算相对位置 |
| storage 无版本号 | 键冲突或格式变更需自行换 `storageKey` |

## 相关文档与代码

| 资源 | 路径 |
|------|------|
| 指针倾斜（常同页使用） | [use-pointer-card-tilt.md](./use-pointer-card-tilt.md) |
| 登录页组合示例 | `src/views/auth/login/index.vue` |
| 测试约定 | [guides/testing.md](../guides/testing.md) |
