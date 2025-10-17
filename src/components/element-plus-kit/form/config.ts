import { ElCheckbox, ElInput, ElRadio, ElSelect } from 'element-plus'

/**
 * 表单组件配置常量
 */

/**
 * 需要从 FormItem 中排除的自定义属性键名
 * 这些属性不会传递给 el-form-item 组件
 */
export const FORM_ITEM_EXCLUDED_KEYS = ['comp', 'compAttrs', 'vIf', 'vShow'] as const

/**
 * 表单组件类型映射配置
 */
export const FORM_ITEM_COMP_MAP = {
  custom: 'div',
  input: ElInput,
  select: ElSelect,
  radio: ElRadio,
  checkbox: ElCheckbox,
} as const
