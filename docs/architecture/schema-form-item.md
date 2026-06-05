# SchemaFormItem 架构设计

本文说明 `src/components/SchemaFormItem/` 的整体设计：模块边界、数据模型、渲染流程、属性/事件/插槽优先级，以及与 Element Plus、`useForm` 的协作方式。

用法与 API 示例见 [components/schema-form-item.md](../components/schema-form-item.md)；`compType` 运行映射与手写类型的维护策略见 [schema-form-item-comp-type.md](./schema-form-item-comp-type.md)。

## 设计目标与职责边界

### 目标

- 用 **schema（`FormItem`）** 描述单个表单项，减少重复的 `el-form-item` + 输入控件模板代码。
- 在 **Element Plus FormItem / 各输入组件** 之上做薄封装：透传原生 props、支持配置化与模板化两种扩展方式。
- 提供 **类型安全** 的 `compType` → 组件 props / 插槽推断（见 `types/`）。

### 负责

| 能力 | 说明 |
|------|------|
| 单表单项渲染 | `el-form-item` + 动态输入组件（或 `custom` 自定义内容） |
| 条件挂载 / 显隐 | `condition`（`v-if`）、`visible`（`v-show`） |
| 控件默认值 | 按 compType 分类生成 `placeholder`、`clearable` 等 |
| 属性分层 | schema 字段 vs 内层控件 props vs 父组件 attrs |
| 插槽合并 | `formItem.slots`、`compProps.slots`、父组件模板插槽 |
| 事件透传 | 配置化 `on*` 与模板 `@*` 合并到内层控件 |
| 类型导出 | `FormItem`、`FormItems`、`FormItemComp` 等 |
| 异步选项辅助 | 导出 `useLoadOptions`（由调用方显式触发加载） |

### 不负责

| 能力 | 说明 |
|------|------|
| 整表循环与栅格 | `colProps` 仅作 JSON 配置类型提示，组件 **不消费**；外层自行 `v-for` + `el-row` / `el-col` |
| 表单状态管理 | 不内置 `useForm`；校验、`resetFields` 由外层 `el-form` + `useForm` 承担 |
| 自动拉取 options | `optionsLoader` 不会自动执行，需配合 `useLoadOptions` 或手动赋值 `compProps.options` |
| 业务 meta | `meta` 字段组件内部不读取，供外层业务逻辑使用 |
| 未知 compType 报错 | 映射表缺失时降级渲染为 `div`，避免白屏（应在开发期补全映射） |

## 模块结构

```
SchemaFormItem/
├── components/
│   └── SchemaFormItem.vue    # 唯一运行时入口：条件、映射、attrs/插槽/事件合并
├── config/
│   ├── comp.ts               # FORM_ITEM_COMP_MAP、COMP_DEFAULT_CONFIG
│   └── form-item.ts          # FORM_ITEM_EXCLUDED_KEYS（不透传给 el-form-item 的 schema 字段）
├── composables/
│   ├── useLoadOptions.ts     # 按 prop 批量执行 optionsLoader，写回 compProps.options
│   └── useAutoExpandOnHover.ts  # 通用交互 composable，与表单项渲染无耦合（同目录导出）
├── styles/
│   └── el.ts                 # 按需引入 el-form-item 与各 compType 对应 EP 样式
└── types/
    ├── form-item.d.ts        # FormItem、FormItems
    ├── comp.d.ts             # FormItemComp、FormItemCompProps（手写，与 comp.ts 同步）
    ├── condition.d.ts        # Condition
    ├── scope.d.ts            # 插槽作用域、CompSlotsConfig、FormItemSlotsConfig
    ├── options.d.ts          # optionsLoader、HasOptionsProp
    └── el.d.ts               # ElFormItemProps、ElColProps
```

### 分工原则

- **`config/`** — 运行时真相源：`compType` 字符串 → Vue 组件；默认 props 生成规则。
- **`types/`** — 编译期真相源：与 `config/comp.ts` **手动同步**（避免 TS 序列化超限，详见 comp-type 文档）。
- **`composables/`** — 横切能力：`useLoadOptions` 与 schema 配置配合；`useAutoExpandOnHover` 为独立工具，未在 `SchemaFormItem.vue` 中使用。
- **`components/`** — 只做渲染编排，不包含业务 API 请求。
- **`styles/`** — 因动态组件无法被 unplugin-vue-components 静态分析，在此集中引入 EP 子组件样式。

## 核心数据模型

### FormItem

`FormItem<T extends FormItemComp>` 扩展 Element Plus `FormItemInstance['$props']`，并增加 schema 专用字段：

| 字段 | 类型 | 消费方 |
|------|------|--------|
| `prop` | `string` | 必填；外层 `v-model` 绑定键、校验 rules 键 |
| `compType` | `FormItemComp` | 映射内层动态组件 |
| `compProps` | `FormItemCompPropsExtended<T>` | 传给内层控件（含 `on*`、`slots`、`optionsLoader`） |
| `slots` | `FormItemSlotsConfig` | `el-form-item` 层插槽（`label` / `error` / `default` 等） |
| `condition` | `Condition` | 根级 `v-if`，为 `false` 时 **卸载** DOM |
| `visible` | `Condition` | `el-form-item` 上 `v-show`，为 `false` 时 **隐藏但仍挂载** |
| `colProps` | `ElColProps` | **仅类型**；栅格由外层渲染 |
| `meta` | `Record<string, any>` | **仅类型**；业务扩展 |
| 其余 EP FormItem props | — | 透传至 `el-form-item`（如 `label`、`rules`、`required`） |

`FormItems` 为 discriminated union 数组类型，便于 `compType` 收窄 `compProps`。

### Condition

```typescript
type Condition<T = Record<string, any>> = boolean | ((data: T) => boolean)
```

- `undefined` / `null`：视为 **通过**（挂载且参与 visible 计算）。
- 函数形式：入参为 props 传入的 **`formData` 整表对象**，需外层保证响应式引用稳定（通常传 `useForm` 的 `form` 或等价 ref 的 `.value` 所在对象）。

`condition` 与 `visible` 语义对比（开发页 `ShowHideTab` 有对照示例）：

| 字段 | DOM 行为 | 典型场景 |
|------|----------|----------|
| `condition: false` | 不渲染 | 依赖字段不存在时卸载子树、减少校验项 |
| `visible: false` | `display: none`，仍挂载 | 临时隐藏、保留值与内部状态 |

### compProps 扩展字段

除 Element Plus 组件 props 外，`compProps` 还支持：

| 字段 | 传给内层控件？ | 说明 |
|------|----------------|------|
| `options` | 是 | 静态或 `useLoadOptions` 写回的下拉数据 |
| `optionsLoader` | **否**（渲染前剥离） | `(formData?) => options \| Promise<options>` |
| `slots` | **否**（单独处理） | 内层控件插槽配置 |
| `on*` 函数 | 是（作为事件 handler） | 与模板 `@*` 合并，模板优先 |

### 插槽作用域 FormItemSlotScope

配置化插槽与模板插槽均注入：

```typescript
interface FormItemSlotScope {
  value: any           // 当前项 v-model 值
  formItem: FormItem   // 完整 schema 项
  [key: string]: any   // el-form-item 等原生插槽参数
}
```

## 渲染流程

```
父组件 v-for formItems
    │
    ├─ v-model="formData[prop]"  ──► defineModel() ──► 内层控件 v-model
    ├─ :form-item="item"
    └─ :form-data="formData"
            │
            ▼
    evalCondition(condition) ──false──► 不渲染（结束）
            │ true
            ▼
    ElFormItem v-show="evalCondition(visible)"
            │
            ├─ formItemAttrs = formItem（剔除 EXCLUDED_KEYS）+ 父 attrs 非 on*
            │
            ├─ compType === 'custom' ?
            │       ├─ 模板 #default 存在 → 渲染模板
            │       └─ 否则 formItem.slots.default → 渲染配置化 default
            │
            └─ 其它 compType
                    resolvedComp = FORM_ITEM_COMP_MAP[compType] ?? 'div'
                    <component :is="resolvedComp" v-bind="processedCompProps" v-model />
                    + 合并后的内层插槽
```

### formItemProps 过滤

`FORM_ITEM_EXCLUDED_KEYS` 定义不传给 `el-form-item` 的 schema 专用键：

`compType`、`compProps`、`slots`、`condition`、`visible`、`colProps`、`meta`

其余 `formItem` 字段（如 `label`、`prop`、`required`、`class`）进入 `formItemAttrs`。

### 默认 props 生成（COMP_DEFAULT_CONFIG）

1. 按 `compType` 归入 `input` / `select` / `picker` / `other`。
2. `input`、`select`、`picker`：自动 `clearable` + 根据 `label` 生成 `placeholder`。
3. `select` 额外 `filterable: true`。
4. `getDefaults` 最后以 `compProps` 覆盖（用户配置最高）。

渲染时 **事件键不参与** 默认 props 的静态合并链，单独提取后再叠加（见下文）。

## attrs / 事件透传与优先级

组件设置 `inheritAttrs: false`，手动拆分 `useAttrs()`：

| 来源 | 目标 | 规则 |
|------|------|------|
| `formItem`（非 EXCLUDED） | `el-form-item` | 与下项合并 |
| attrs 非 `on*` | `el-form-item` | 覆盖/补充 formItem 同名字段 |
| attrs `on*` 且为函数 | **内层输入控件** | 不参与 form-item |
| attrs `on*` 非函数 | **丢弃** | 两边都不绑定 |

内层控件 `processedCompProps` 合并顺序（后者覆盖前者）：

1. `COMP_DEFAULT_CONFIG` 默认值（**剔除** `on*`）
2. `compProps` 普通属性（**剔除** `optionsLoader`、`slots`、`on*`）
3. `compProps` 中的 `on*` 处理器
4. 父组件模板上的 `@focus`、`@change` 等（attrs 中的 `on*`）

**结论：模板 `@*` > `compProps.on*` > 默认值**（与开发页「事件优先级」Tab 一致）。

非事件属性 **不会** 从模板 attrs 透传到内层控件，仅进入 `el-form-item`。

## 插槽命名与优先级

### 两层插槽

| 层级 | 配置位置 | 命名约定 | 挂载目标 |
|------|----------|----------|----------|
| 表单项层 | `formItem.slots` | `label`、`error`、…（`ElFormItemSlots`） | `el-form-item` |
| 控件层 | `compProps.slots` | 各 EP 组件原生插槽名（如 `prefix`、`suffix`） | 动态输入组件 |

常量 `FORM_ITEM_SLOT_NAMES = ['label', 'error', 'default']`：在此集合内且 **不是** `default` 的，视为表单项层；**不在**集合内的模板插槽名视为控件层。

`formItem.slots.default` **不**挂到 `el-form-item` 的 default，而留给 `compType: 'custom'` 整格内容（与模板 `#default` 二选一）。

### 同名优先级

对每一层：**父组件模板插槽 > schema 配置插槽**。

实现方式：若模板提供了某插槽名，则从 `effectiveConfig*` 列表中 **过滤掉** 同名配置插槽，避免双重渲染。

`custom` 类型 default 内容优先级：

1. 模板 `#default`
2. `formItem.slots.default`
3. 皆无则表单项内容为空

配置化插槽通过 `component :is="slotFn"` 渲染；`error` 插槽外包一层 `<span>`（与 EP 结构兼容）。

开发页对照：`SlotsTab`（模板）、`ConfigSlotsTab`（配置）、`SlotPriorityTab`（覆盖关系）。

## compType 映射与类型体系

- **运行映射**：`config/comp.ts` → `EL_COMP_MAP` + `EXPAND_COMP_MAP`（含 `custom`）→ `FORM_ITEM_COMP_MAP`。
- **类型映射**：`types/comp.d.ts` → `FormItemComp` 联合类型、`FormItemCompProps<T>` 等，与运行映射 **手动同步**。

未注册 `compType` 时：`resolvedComp` 回退为 `'div'`，页面不崩溃但无输入能力。

详细维护原因、同步清单与编译器限制见 [schema-form-item-comp-type.md](./schema-form-item-comp-type.md)。

## 扩展新 compType

1. 在 `config/comp.ts` 的 `EL_COMP_MAP`（或 `EXPAND_COMP_MAP`）增加 `compType → 组件`。
2. 在 `types/comp.d.ts` 的 `ElCompMap` / `FormItemComp` 联合类型中增加同名键。
3. 若属于 input/select/picker 分类，在 `COMP_DEFAULT_CONFIG.getCompType` 中归类以继承 placeholder 规则；否则归入 `other`。
4. 在 `styles/el.ts` 增加对应 EP 组件样式 import（保证按需样式完整）。
5. 在 `/dev/schema-form-item` 增加或可覆盖的示例 Tab 中验证 props / 插槽 / 事件。
6. 若组件 props 含 `options`，`HasOptionsProp` 会自动允许 `optionsLoader` 类型扩展。

## 与 useForm / Element Plus 的协作

### 推荐组装方式

```vue
<script setup lang="ts">
import type { FormItems } from '@/components/SchemaFormItem'

const { form, formRef, validate, reset } = useForm({ ... })
const formItems: FormItems = [ ... ]
</script>

<template>
  <el-form ref="formRef" :model="form" :rules="rules">
    <SchemaFormItem
      v-for="item in formItems"
      :key="item.prop"
      v-model="form[item.prop]"
      :form-item="item"
      :form-data="form"
    />
  </el-form>
</template>
```

要点：

- **双向绑定**：每项必须 `v-model="form[prop]"`；`SchemaFormItem` 使用 `defineModel()`，不直接从 `formData` 读写字段值。
- **条件函数**：`:form-data="form"`（或等价 reactive 对象），使 `condition` / `visible` / `optionsLoader` 能读到最新整表数据。
- **校验**：rules 挂在 `el-form` 上，按 `prop` 匹配；`condition: false` 卸载的项不参与 DOM 校验。
- **useForm** 提供 `form`、`formRef`、`validate`、`reset`、`isDirty` 等，与 SchemaFormItem **无直接 import 关系**，仅在页面层组合。完整设计见 [use-form.md](./use-form.md)。

### useLoadOptions

```typescript
const { loadOptions, getOptions, loading } = useLoadOptions(formItems, formData)
await loadOptions('city') // 或 loadOptions(['a','b']) / loadOptions()
```

- 扫描 `compProps.optionsLoader`，异步结果写入 **`compProps.options`**（原地突变 schema 对象）。
- 失败时控制台报错并将 `options` 置 `[]`。
- 联动场景需外层 `watch` 表单字段后再次 `loadOptions`（见 `AsyncLoadTab`）。

SchemaFormItem **不会** 监听 `optionsLoader` 或自动请求。

### Element Plus 样式

`index.ts` 通过 `import './styles'` 引入 `styles/el.ts`，确保动态 `:is` 组件样式在 production 按需加载场景下可用。

## 已知限制与未实现项

| 项 | 说明 |
|----|------|
| 无内置 Form 渲染器 | 不提供 `<SchemaForm :items />`；栅格、分组、按钮区需页面自行布局（常用 `compType: 'custom'` + 模板 default） |
| `colProps` / `meta` 未消费 | 仅方便 JSON schema 与外层工具读取 |
| `optionsLoader` 非响应式触发 | 必须手动调用 `useLoadOptions` 或 watch 联动 |
| 未知 `compType` 静默降级 | 渲染 `div`，无开发期 warning |
| 模板 attrs 非事件不透传至内层控件 | 仅 `on*` 进入 `processedCompProps` |
| `useAutoExpandOnHover` | 与 SchemaFormItem 渲染无关，仅为同包导出 |
| `date-picker-panel` / `color-picker-panel` | 已在映射表与类型中注册，开发页未单独示例 |
| `scope.d.ts` 路径 | 类型文件中 `@/FormItem` 为历史路径别名，运行时以 `SchemaFormItem/types` 为准 |

## 相关文档与代码

| 资源 | 路径 |
|------|------|
| 用法与 API | [components/schema-form-item.md](../components/schema-form-item.md) |
| compType 类型维护 | [schema-form-item-comp-type.md](./schema-form-item-comp-type.md) |
| 开发联调页 | `/dev/schema-form-item` → `src/views/dev/schema-form-item/` |
| E2E | `e2e/schema-form-item.spec.ts` |
