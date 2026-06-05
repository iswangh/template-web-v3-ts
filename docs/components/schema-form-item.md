# SchemaFormItem

基于 schema 配置渲染 Element Plus 表单项的可复用组件，位于 `src/components/SchemaFormItem/`。

架构设计（数据流、模块分工、插槽/事件优先级等）见 [architecture/schema-form-item.md](../architecture/schema-form-item.md)。

## 基本用法

```vue
<script setup lang="ts">
import type { FormItems } from '@/components/SchemaFormItem'

const formData = ref({ username: '', role: '' })

const schema: FormItems = [
  {
    prop: 'username',
    label: '用户名',
    compType: 'input',
    compProps: { placeholder: '请输入用户名' },
  },
  {
    prop: 'role',
    label: '角色',
    compType: 'select',
    compProps: { options: [{ label: '管理员', value: 'admin' }] },
  },
]
</script>

<template>
  <el-form :model="formData">
    <SchemaFormItem
      v-for="item in schema"
      :key="item.prop"
      :form-item="item"
      :form-data="formData"
    />
  </el-form>
</template>
```

`SchemaFormItem` 位于 `src/components/`，由 unplugin-vue-components 自动注册。

配置数组请使用 `FormItems`（判别联合），以便按 `compType` 收窄后 `compProps` 有对应 Element Plus 组件的属性提示；勿用 `FormItem[]`。也可写 `] satisfies FormItems` 保留字面量推断。

## 核心 Props

| Prop | 类型 | 说明 |
|------|------|------|
| `formItem` | `FormItem` | 表单项 schema 配置 |
| `formData` | `Record<string, any>` | 绑定表单数据对象 |

## 主要能力

- **compType 映射** — 通过 `compType` 动态渲染 input / select / date-picker 等控件
- **条件渲染** — `condition` 支持布尔或 `(formData) => boolean`
- **显隐控制** — `visible` 同上
- **异步选项** — `useLoadOptions` composable 加载下拉数据
- **插槽** — 支持自定义表单项、控件、前后缀等 slot（优先级见开发页示例）
- **事件透传** — 父组件 `on*` 事件优先绑定到内层输入组件

## 开发调试页

本地访问 `/dev/schema-form-item`（白名单路由，无需登录），包含：

- 基础表单项
- 条件显示 / 异步加载
- 插槽与事件优先级
- 各 compType 示例

对应源码：`src/views/dev/schema-form-item/`。

## 相关 composable

### useForm

通用表单管理（`src/composables/form/useForm.ts`）。架构与 API 见 [use-form.md](../architecture/use-form.md)。

```typescript
const { form, formRef, loading, submit, reset, isDirty } = useForm<LoginForm>({
  username: '',
  password: '',
})
```

### useLoadOptions

SchemaFormItem 导出，用于异步加载表单项 options。

## 类型与扩展

`src/components/SchemaFormItem/` 为配套模块（组件、types、config、composables、styles 统一从此目录导出）。新增 `compType` 时需同时维护运行映射与手写类型，步骤与类型推导说明见 [architecture/schema-form-item.md](../architecture/schema-form-item.md#comptype-映射与类型体系)。

## 目录结构

```
SchemaFormItem/
├── components/       # SchemaFormItem.vue
├── composables/      # useLoadOptions、useAutoExpandOnHover
├── config/           # comp 映射、默认配置
├── styles/           # Element Plus 样式补丁
└── types/            # FormItem、Condition、compType 等类型
```
