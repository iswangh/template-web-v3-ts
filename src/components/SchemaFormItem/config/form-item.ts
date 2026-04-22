/**
 * 不传给 el-form-item 的扩展字段（含布局/业务 meta，由外层自行消费）
 */
export const FORM_ITEM_EXCLUDED_KEYS = [
  'compType',
  'compProps',
  'slots',
  'vIf',
  'vShow',
  'colProps',
  'meta',
] as const
