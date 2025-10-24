/* eslint-disable ts/no-explicit-any */
import type { FormItem } from './types'
import { ElAutocomplete, ElCascader, ElCheckboxGroup, ElColorPicker, ElColorPickerPanel, ElDatePicker, ElDatePickerPanel, ElInput, ElInputNumber, ElInputTag, ElMention, ElRadioGroup, ElRate, ElSelect, ElSelectV2, ElSlider, ElSwitch, ElTimePicker, ElTimeSelect, ElTransfer, ElTreeSelect } from 'element-plus'

/**
 * 表单组件配置常量
 */

/**
 * 需要从 FormItem 中排除的自定义属性键名
 * 这些属性不会传递给 el-form-item 组件
 */
export const FORM_ITEM_EXCLUDED_KEYS = ['comp', 'compAttrs', 'vIf', 'vShow'] as const

/**
 * 拓展的组件映射
 */
const EXPAND_COMP_MAP = {
  custom: 'div',
} as const

/**
 * Element Plus 组件映射
 */
const EL_COMP_MAP = {
  'autocomplete': ElAutocomplete,
  'cascader': ElCascader,
  'checkbox': ElCheckboxGroup,
  'color-picker-panel': ElColorPickerPanel,
  'color-picker': ElColorPicker,
  'date-picker-panel': ElDatePickerPanel,
  'date-picker': ElDatePicker,
  'input': ElInput,
  'input-number': ElInputNumber,
  'input-tag': ElInputTag,
  'mention': ElMention,
  'radio': ElRadioGroup,
  'rate': ElRate,
  'select': ElSelect,
  'select-v2': ElSelectV2,
  'slider': ElSlider,
  'switch': ElSwitch,
  'time-picker': ElTimePicker,
  'time-select': ElTimeSelect,
  'transfer': ElTransfer,
  'tree-select': ElTreeSelect,
} as const

/**
 * 表单组件类型映射配置
 */
export const FORM_ITEM_COMP_MAP = { ...EL_COMP_MAP, ...EXPAND_COMP_MAP } as const

/**
 * 动态组件默认配置
 */
export const COMPONENT_DEFAULT_CONFIG = {
  /**
   * 获取组件默认属性
   */
  getDefaults(formItem: FormItem) {
    const { comp, compAttrs = {} } = formItem

    // 组件类型
    const compType = this.getComponentType(comp)

    // 组件默认属性
    const compDefaults = this.buildComponentAttrs(formItem, compType)

    return {
      ...compDefaults,
      ...compAttrs, // 用户配置最后合并，优先级最高
    }
  },

  /**
   * 判断组件类型
   */
  getComponentType(comp: string) {
    // 输入类组件
    const inputComponents = ['autocomplete', 'input', 'input-number', 'input-tag', 'mention']

    // 选择类组件
    const selectComponents = ['cascader', 'select', 'select-v2', 'tree-select']

    // 日期类组件
    const pickerComponents = ['date-picker', 'time-select', 'time-picker']

    if (inputComponents.includes(comp))
      return 'input'
    if (selectComponents.includes(comp))
      return 'select'
    if (pickerComponents.includes(comp))
      return 'picker'

    return 'other'
  },

  /**
   * 动态生成 placeholder
   */
  generatePlaceholder(formItem: FormItem, type: string) {
    const { label } = formItem

    if (type === 'input')
      return label ? `请输入${label}` : '请输入'

    if (['select', 'picker'].includes(type))
      return label ? `请选择${label}` : '请选择'

    return ''
  },

  /**
   * 构建组件属性
   */
  buildComponentAttrs(formItem: FormItem, type: string) {
    const defaults: Record<string, any> = {}
    if (['input', 'select', 'picker'].includes(type)) {
      defaults.placeholder = this.generatePlaceholder(formItem, type)
      defaults.clearable = true
    }
    if (['select'].includes(type)) {
      defaults.filterable = true
    }

    return defaults
  },
}
