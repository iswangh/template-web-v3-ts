# usePointerCardTilt 架构设计

本文说明 `src/composables/interactions/usePointerCardTilt.ts` 的设计：指针驱动的 3D 卡片倾斜、无障碍与设备适配、GSAP 运行时管理，以及事件绑定约定。

## 设计目标与职责边界

### 目标

- 根据指针在卡片内的 **归一化位置** 施加轻微 `rotationX` / `rotationY`，并在 pointer enter 时沿 Y 轴 **上浮**（`y` translate）。
- 使用 GSAP `quickTo` 平滑过渡， **`pointermove` 合并到 `requestAnimationFrame`**，降低高频事件压力。
- 尊重 **`prefers-reduced-motion: reduce`** 与 **`pointer: coarse`**，避免 motion 敏感用户不适、触控设备过度倾斜。

### 负责

| 能力 | 说明 |
|------|------|
| 3D 上下文 | `transformPerspective`、`transformOrigin`、`force3D` 统一由 composable 设置 |
| 倾斜计算 | `(px, py)` → `rotationY` / `rotationX`，可选 `maxAbsRotation` 钳制 |
| 上浮 | `pointerenter` → `yTo(hoverLiftScaled)`；`pointerleave` → 归零 |
| 性能 | `schedulePointerTilt` 每帧最多 flush 一次 |
| 无障碍 | reduced-motion 时 teardown，立即归零 transform |
| 粗指针适配 | `(pointer: coarse)` 时缩放倾斜与上浮强度 |
| 清理 | `onUnmounted` 取消 rAF、`killTweensOf`、停止 media query watch |

### 不负责

| 能力 | 说明 |
|------|------|
| 拖动位移 | 由 `useDragPosition` 等独立 composable 处理 |
| 自动绑定 DOM 事件 | 返回 handler，由模板显式 `@pointerenter` / `@pointermove` / `@pointerleave` |
| 键盘 / 焦点倾斜 | 仅响应 Pointer 事件 |
| 卡片尺寸响应式重算 | 每次 move 用当前 `getBoundingClientRect()`，resize 后下一帧自然更新 |

## 模块结构

```
src/composables/interactions/
├── usePointerCardTilt.ts   # 实现
└── index.ts                # 再导出
```

## API

### UsePointerCardTiltOptions

| 选项 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `rotateYFactor` | `number` | `20` | 横向 `(px - 0.5) * factor * tiltIntensity` |
| `rotateXFactor` | `number` | `14` | 纵向 `(0.5 - py) * factor * tiltIntensity` |
| `hoverLift` | `number` | `-4` | enter 时 Y 平移（像素，负值表示上浮） |
| `duration` | `number` | `0.45` | GSAP quickTo 时长（秒） |
| `ease` | `string` | `'power3.out'` | GSAP 缓动 |
| `perspective` | `number` | `1100` | `transformPerspective` |
| `maxAbsRotation` | `number` | 无 | 单轴旋转绝对值上限（度）；不传则不钳制 |
| `coarsePointerTiltScale` | `number` | `0.75` | 粗指针下倾斜与上浮强度乘数 |

### 返回值

| 成员 | 类型 | 说明 |
|------|------|------|
| `cardRef` | `Ref<HTMLElement \| undefined>` | 绑定倾斜目标元素 |
| `onCardPointerEnter` | `() => void` | 模板 `@pointerenter` |
| `onCardPointerMove` | `(event: PointerEvent) => void` | 模板 `@pointermove` |
| `onCardPointerLeave` | `() => void` | 模板 `@pointerleave` |

### 使用示例

```vue
<script setup lang="ts">
const {
  cardRef,
  onCardPointerEnter,
  onCardPointerMove,
  onCardPointerLeave,
} = usePointerCardTilt({ hoverLift: 0 })
</script>

<template>
  <div
    ref="cardRef"
    class="card--interactive"
    @pointerenter="onCardPointerEnter"
    @pointermove="onCardPointerMove"
    @pointerleave="onCardPointerLeave"
  >
    <!-- 内容 -->
  </div>
</template>
```

登录页将 `hoverLift` 设为 `0`，仅保留倾斜、避免与布局 padding 冲突。

## 行为与生命周期

### 运行时初始化（setupTiltRuntime）

在 **非 reduced-motion** 且 `cardRef` 已挂载时执行一次：

1. `gsap.set` 透视与 `force3D`。
2. 创建三个 `quickTo`：`rotationX`、`rotationY`、`y`。
3. `isTiltRuntimeReady = true`，防止 media query 频繁触发时重复创建。

### pointermove 流水线

```
onCardPointerMove
    │
    └─ schedulePointerTilt（记录 clientX/Y，若无 pending rAF 则 requestAnimationFrame）
            │
            flushPointerTilt
                ├─ getBoundingClientRect → px, py ∈ [0,1]
                ├─ rawY = (px - 0.5) * rotateYFactor * tiltIntensity
                ├─ rawX = (0.5 - py) * rotateXFactor * tiltIntensity
                └─ rotateYTo / rotateXTo(clampRotation(...))
```

### pointerenter / pointerleave

- **enter**：若未 reduced-motion 且 `yTo` 就绪 → `yTo(hoverLiftScaled)`。
- **leave**：取消 pending rAF；`rotateX/YTo(0)`、`yTo(0)`。

### 环境偏好（updateEnvironmentPreferences）

监听 VueUse `useMediaQuery`：

| 查询 | 行为 |
|------|------|
| `(prefers-reduced-motion: reduce)` | `true` → `teardownTiltRuntime()`（kill 动画并归零） |
| `(pointer: coarse)` | `true` → `tiltIntensity = coarsePointerTiltScale`，并缩放 `hoverLift` |

`watch(..., { immediate: true })` + `onMounted` 再同步一次，解决 **ref 晚于 immediate watch 挂载** 时 runtime 未初始化的问题。

### teardownTiltRuntime

- `cancelAnimationFrame` pending move。
- `gsap.killTweensOf(cardRef)`，`gsap.set` 旋转与 y 为 0。
- 清空 `quickTo` 引用，`isTiltRuntimeReady = false`。

### 与 useDragPosition 的组合

倾斜作用于 **内层** `cardRef`，拖动作用于 **外层** shell，两者 transform 不写在同一元素上。见 [use-drag-position.md](./use-drag-position.md#与-usepointercardtilt-的组合模式)。

## 依赖

| 依赖 | 用途 |
|------|------|
| `@vueuse/core` `useMediaQuery` | reduced-motion、coarse pointer |
| `gsap` | `set`、`quickTo`、`killTweensOf` |
| Vue `ref` / `watch` / `onMounted` / `onUnmounted` | 生命周期与响应式 |

## 测试说明

| 层级 | 路径 | 说明 |
|------|------|------|
| 单元测试 | — | **暂无**；适合 mock `gsap` 与 `matchMedia` 测钳制、reduced-motion teardown |
| E2E | `e2e/auth.spec.ts` | 认证页视觉交互（非断言 transform 数值） |

倾斜属 **渐进增强**：E2E 通常只验证页面可用；精细回归建议补 unit spec（rAF 合并、clamp、teardown）。

## 已知限制

| 项 | 说明 |
|----|------|
| 需手动绑定三个 pointer 事件 | 避免 composable 隐式占满事件策略 |
| 无 `usePointerCardTilt.spec.ts` | 媒体查询与 GSAP 交互暂无自动化回归 |
| 仅 pointer 类型事件 | 无 touch 专用 fallback（浏览器一般映射为 pointer） |
| reduced-motion 切换 | 依赖系统设置变化 + watch；部分旧浏览器 media query 行为差异 |

## 相关文档与代码

| 资源 | 路径 |
|------|------|
| 拖动位移（常同页使用） | [use-drag-position.md](./use-drag-position.md) |
| 登录页示例 | `src/views/auth/login/index.vue` |
| 测试约定 | [guides/testing.md](../guides/testing.md) |
