# useForm 架构设计

本文说明 `src/composables/form/useForm.ts` 的设计：职责边界、数据生命周期、与 Element Plus `el-form` / `SchemaFormItem` 的协作方式，以及 `set` / `reset` 的合并语义。

## 设计目标与职责边界

### 目标

- 为页面层提供 **类型安全** 的表单数据容器（`ref`），与 Element Plus `FormInstance` 解耦封装。
- 统一 **默认值快照**、**脏检查**、**整表校验**、**提交编排** 等常见流程，减少各页面重复样板代码。
- 与 `SchemaFormItem` **无直接 import 关系**，仅在视图层组合（`v-model` + `formRef`）。

### 负责

| 能力 | 说明 |
|------|------|
| 表单数据 | `form`：`ref<T>`，页面与 `el-form :model`、各表单项 `v-model` 绑定 |
| EP 实例引用 | `formRef`：绑定 `<el-form ref="formRef">`，供校验与 `resetFields` |
| 脏检查 | `isDirty`：当前 `form` 与初始默认值快照是否 deep equal |
| 局部赋值 | `set(partial)`：按优先级合并写入字段 |
| 重置 | `reset(clear?)`：调用 EP `resetFields` 并恢复/清空本地 `form` |
| 校验 | `validate()`：委托 `formRef.validate()` |
| 提交编排 | `submit(handler)`：先 `validate`，通过后以当前 `form.value` 调用 handler |
| 加载占位 | `loading`：只读 `ref`，供页面自行在 handler 内配合 async 逻辑使用（composable 内部 **不** 自动切换） |

### 不负责

| 能力 | 说明 |
|------|------|
| 表单项渲染 | 不提供 schema 循环；由 `SchemaFormItem` 或手写 `el-form-item` 承担 |
| rules 定义 | 校验规则由页面传入 `el-form :rules` |
| 字段级校验 | 不封装 `validateField`；需时直接访问 `formRef.value` |
| 自动 loading | `submit` 不会将 `loading` 置为 `true` / `false` |
| 请求 / 错误提示 | 业务 API、Message 等由 `submit` 的 handler 或页面层处理 |

## 模块结构

```
src/composables/
├── form/
│   ├── useForm.ts        # 实现
│   ├── useForm.spec.ts   # 单元测试
│   └── index.ts          # 再导出
└── index.ts              # 聚合 form + interactions
```

通过 `unplugin-auto-import` 全局可用，类型见 `src/types/auto-imports.d.ts`。

## API

### 签名

```typescript
function useForm<T extends Record<string, any>>(
  defaultData?: Partial<T> | (() => Partial<T>),
)
```

- `defaultData` 可为静态对象或工厂函数；初始化与 `reset()` 恢复时均会 **深拷贝** 快照，避免引用污染。
- 泛型 `T` 约束为对象类型，与 EP `model` 用法一致。

### 返回值

| 成员 | 类型 | 说明 |
|------|------|------|
| `form` | `Ref<T>` | 表单数据，双向绑定源 |
| `formRef` | `Ref<FormInstance \| undefined>` | 绑定 `el-form` ref |
| `loading` | `Readonly<Ref<boolean>>` | 初始 `false`；composable 不修改，供页面扩展 |
| `isDirty` | `ComputedRef<boolean>` | 相对初始快照是否已变更 |
| `set` | `(data: Partial<T>) => void` | 合并写入（见下文） |
| `reset` | `(clear?: boolean) => void` | 重置 EP 字段 + 恢复/清空本地数据 |
| `validate` | `() => Promise<void>` | 整表校验，失败时 reject（EP 行为） |
| `submit` | `(handler: (formData: T) => void \| Promise<void>) => Promise<void>` | 校验通过后执行 handler |

## 行为与生命周期

### 初始化

```
defaultData（对象或工厂）
    │
    ▼
_cloneDeep → defaultValues（不可变快照，用于 isDirty / reset(false)）
    │
    ▼
_cloneDeep → form（可变 ref，页面绑定源）
```

- `isDirty` 使用 `_isEqual(form.value, defaultValues)`，比较的是 **初始快照**，不是「上一次 set 前的状态」。

### set 合并优先级

```typescript
form.value = { ...cloneDeep(defaultValues), ...form.value, ...data }
```

| 优先级 | 来源 |
|--------|------|
| 最高 | 本次 `set(data)` 传入字段 |
| 中 | 当前 `form.value` 已有字段 |
| 最低 | 初始 `defaultValues` |

因此 `set` 不会删除未出现在参数中的键；若需整表替换应直接赋值 `form.value` 或 `reset` 后再 `set`。

### reset 两种模式

1. **`reset()` / `reset(false)`**（默认）  
   - 调用 `formRef.value?.resetFields()`（清除 EP 校验态、触发表单项 reset）。  
   - `form.value = cloneDeep(defaultValues)`。

2. **`reset(true)`**  
   - 同样调用 `resetFields()`。  
   - `form.value = {} as T`（空对象，**不**保留 defaultData 键）。

### validate 与 submit

```
submit(handler)
    │
    ├─ await validate()  → formRef.validate()，失败则中断
    │
    └─ await handler(form.value)
```

- `formRef` 未挂载时 `validate()` 为 no-op（可选链），`submit` 仍会调用 handler——页面应保证提交前 `el-form` 已挂载。
- `loading` 为 composable 内 `ref(false)` 的 **只读** 导出，`submit` 不会自动切换；页面若需提交中状态，应在 handler 内自行维护独立 ref，或后续扩展 `useForm`。

### 与 SchemaFormItem 协作

推荐组装方式见 [schema-form-item.md](./schema-form-item.md#与-useform--element-plus-的协作)：

- `el-form` 绑定 `:model="form"`、`ref="formRef"`、`:rules="rules"`。
- 每项 `SchemaFormItem` 使用 `v-model="form[item.prop]"`、`:form-data="form"`。
- `condition` / `visible` / `optionsLoader` 依赖响应式整表对象，应传 `form`（ref 的 `.value` 在模板中自动解包）。

## 依赖

| 依赖 | 用途 |
|------|------|
| `element-plus` | `FormInstance` 类型与 `validate` / `resetFields` |
| `lodash-es`（自动导入 `_cloneDeep`、`_isEqual`） | 默认值快照与脏检查 |
| Vue `ref` / `computed` / `readonly` | 响应式容器 |

## 测试说明

| 层级 | 路径 | 覆盖点 |
|------|------|--------|
| 单元测试 | `src/composables/form/useForm.spec.ts` | 默认值、`set`、`reset` / `reset(true)`、`isDirty`、`submit` 校验顺序 |
| E2E | `e2e/schema-form-item.spec.ts` | 开发页各 Tab 与 `useForm` 组合的实际表单交互 |
| E2E | `e2e/auth.spec.ts` | 登录页 `useForm` + 提交流程（间接） |

单元测试 **不挂载** 真实 `el-form`，通过 mock `formRef.validate` 验证 `submit` 编排。新增行为（如内置 loading）应优先补充 `useForm.spec.ts`。

## 已知限制

| 项 | 说明 |
|----|------|
| `loading` 未内置 | JSDoc 提及加载状态，但 `submit` 当前不修改 `loading` |
| `formRef` 空挂载 | 未绑定 `el-form` 时校验被跳过 |
| `set` 非替换语义 | 不能通过 `set` 删除字段，需 `reset` 或直接改 `form.value` |
| 无 `validateField` 封装 | 字段级校验需使用 EP 实例 API |

## 相关文档与代码

| 资源 | 路径 |
|------|------|
| SchemaFormItem 协作 | [schema-form-item.md](./schema-form-item.md) |
| 组件用法 | [components/schema-form-item.md](../components/schema-form-item.md) |
| 测试约定 | [guides/testing.md](../guides/testing.md) |
| 登录页示例 | `src/views/auth/login/index.vue` |
| 开发联调页 | `src/views/dev/schema-form-item/` |
