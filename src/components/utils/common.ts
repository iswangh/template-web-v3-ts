/**
 * 条件渲染判断函数
 *
 * 用于处理表单项的条件渲染逻辑，支持布尔值或返回布尔值的函数
 * 主要用于 v-if 和 v-show 指令的条件判断
 *
 * @param condition - 判断条件，可以是布尔值、返回布尔值的函数或 undefined
 * @returns 返回标准化的布尔值结果
 *
 * @throws {Error} 当 condition 函数执行抛出错误时，会捕获并返回 false
 *
 * @example
 * ```typescript
 * // 布尔值
 * const visible = checkCondition(true)
 * // 返回: true
 *
 * // 函数
 * const visible = checkCondition(() => someValue > 0)
 * // 返回: 函数执行结果
 *
 * // 在模板中使用
 * v-if="checkCondition(item.vIf)"
 * v-show="checkCondition(item.vShow)"
 * ```
 */
export function checkCondition(
  condition?: boolean | (() => boolean),
) {
  if (condition === undefined)
    return true

  try {
    return typeof condition === 'function' ? condition() : condition
  }
  catch (error) {
    console.warn('checkCondition function execution error:', error)
    return false
  }
}
