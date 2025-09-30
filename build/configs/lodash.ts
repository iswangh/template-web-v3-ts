import { createImportMappings } from '../utils'

/**
 * 需要按需导入的lodash方法
 */
const lodashMethods = [
  'get',
  'set',
  'has',
  'cloneDeep',
  'omit',
  'pick',
  'isEmpty',
  'debounce',
  'throttle',
  'once',
  'isString',
  'isNumber',
  'isArray',
  'isObject',
  'isFunction',
  'map',
  'filter',
  'find',
  'orderBy',
]

/**
 * 生成lodash方法与别名的映射数组
 */
export const lodashImports = createImportMappings(lodashMethods, '_')
