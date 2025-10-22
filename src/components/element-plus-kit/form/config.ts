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
  'Autocomplete': ElAutocomplete,
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
