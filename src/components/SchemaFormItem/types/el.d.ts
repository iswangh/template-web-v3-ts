import type { ColInstance, FormItemInstance } from 'element-plus'

export type ElFormItemProps = FormItemInstance['$props']

export type ElFormItemSlots = FormItemInstance['$slots']

/** 自 ElCol 实例推导，与 `el-col` 的 props 对齐（供配置里 `colProps` 等字段的类型提示） */
export type ElColProps = ColInstance['$props']
