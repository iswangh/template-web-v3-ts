/* eslint-disable ts/no-explicit-any */
import type { FormItemInstance, FormRules } from 'element-plus'
import type { FORM_ITEM_COMP_MAP } from './config'

/**
 * Element Plus Form Attributes
 *
 * 由于 `FormInstance['$slots']` 类型定义存在问题，
 * 暂时无法直接使用 `FormInstance['$props']`，
 * 因此手动定义了部分常用属性以确保类型安全。
 *
 * @see {@link https://element-plus.org/zh-CN/component/form.html#form-attributes Element Plus Form Attributes}
 */
interface ElFormAttrs {
  // 数据相关
  model?: Record<string, any>
  rules?: FormRules

  // 布局相关
  inline?: boolean
  labelPosition?: 'left' | 'right' | 'top'
  labelWidth?: string | number
  labelSuffix?: string

  // 样式相关
  size?: 'large' | 'default' | 'small'
  disabled?: boolean
  hideRequiredAsterisk?: boolean

  // 验证相关
  showMessage?: boolean
  inlineMessage?: boolean
  statusIcon?: boolean
  validateOnRuleChange?: boolean
  scrollToError?: boolean
}

/** Element Plus FormItem 属性 */
type ElFormItemAttrs = FormItemInstance['$props']

/** 表单组件配置映射类型 */
type FormCompConfig = typeof FORM_ITEM_COMP_MAP

/** 支持的表单组件枚举 */
type FormItemComp = keyof FormCompConfig

// 工厂类型工具
interface FormTypeFactory<T extends keyof FormCompConfig> {
  props: InstanceType<FormCompConfig[T]>['$props']
  slots: InstanceType<FormCompConfig[T]>['$slots']
}

/**
 * 根据组件类型推断对应的属性类型
 *  @template T - 组件类型
 */
export type FormItemCompAttrs<T extends FormItemComp> = {} & FormTypeFactory<T>['props']

/** 需要排除的自定义属性键名类型 */
export type FormItemExcludedKeys = typeof FORM_ITEM_EXCLUDED_KEYS[number]

/** 提取后的 FormItem 属性类型（排除自定义属性） */
type ExtractedFormItemProps = Omit<FormItem, FormItemExcludedKeys>

/**
 * Form 组件属性
 *
 * 扩展自 Element Plus 的 Form 组件属性，添加了自定义配置选项
 *
 * @extends {ElFormAttrs} Element Plus Form 组件原始属性
 *
 * @property {FormItem[]} formItems - 表单项配置数组
 */
export type FormProps = { formItems: FormItem[] } & ElFormAttrs

/**
 * FormItem 属性
 *
 * 扩展自 Element Plus 的 FormItem 组件属性，添加了自定义配置选项
 *
 * @template T - 组件类型
 * @extends {ElFormItemAttrs} Element Plus FormItem 组件原始属性
 *
 * @property {FormItemComp} comp 使用的组件类型
 * @property {FormItemCompAttrs<T>} [compAttrs] 传递给组件的属性配置对象
 * @property {FormItemCompSlots<T>} [compSlots] 动态组件的插槽配置
 * @property {boolean | (() => boolean)} [vIf] 条件渲染控制，支持布尔值或返回布尔值的函数
 * @property {boolean | (() => boolean)} [vShow] 显示/隐藏控制，支持布尔值或返回布尔值的函数
 *
 * @see {@link https://element-plus.org/zh-CN/component/form.html#form-item-attributes Element Plus Form Item Attributes}
 */
export interface FormItem<T extends FormItemComp = FormItemComp> extends ElFormItemAttrs {
  prop: string
  comp: T
  compAttrs?: FormItemCompAttrs<T>
  vIf?: boolean | (() => boolean)
  vShow?: boolean | (() => boolean)
}

/** formItems 配置类型 */
export type FormItems = FormItem[]
