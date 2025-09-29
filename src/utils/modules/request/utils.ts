import type { ParamsSerializerOptions } from './types'
import type { ExtendableObject } from '@/types'

/**
 * 将参数对象序列化为查询字符串
 * 用于 axios 的 paramsSerializer 配置项，处理 GET 请求中的查询参数
 *
 * @param params - 需要序列化的参数对象
 * @param options - 序列化选项
 * @param options.format - 数组格式化策略: 'repeat' | 'index' | 'join'，默认为 'repeat'
 *   - 'repeat': 重复键名格式，如 `tags=vue&tags=react`
 *   - 'index': 索引格式，如 `tags[0]=vue&tags[1]=react`
 *   - 'join': 连接格式，如 `tags=vue,react` (分隔符可配置)
 * @param options.startIndex - 数组索引起始值，仅在 index 模式下有效，默认为 0
 * @param options.separator - 数组元素分隔符，仅在 join 模式下有效，默认为 ','
 *
 * @example
 * ```typescript
 * // 默认 repeat 模式
 * paramsSerializer({ tags: ['vue', 'react'], status: 'active' })
 * // 输出: 'tags=vue&tags=react&status=active'
 *
 * // index 模式
 * paramsSerializer({ tags: ['vue', 'react'], status: 'active' }, { format: 'index' })
 * // 输出: 'tags[0]=vue&tags[1]=react&status=active'
 *
 * // index 模式自定义起始索引
 * paramsSerializer({ tags: ['vue', 'react'], status: 'active' }, { format: 'index', startIndex: 1 })
 * // 输出: 'tags[1]=vue&tags[2]=react&status=active'
 *
 * // join 模式
 * paramsSerializer({ tags: ['vue', 'react'], status: 'active' }, { format: 'join' })
 * // 输出: 'tags=vue,react&status=active'
 *
 * // join 模式自定义分隔符
 * paramsSerializer({ tags: ['vue', 'react'], status: 'active' }, { format: 'join', separator: ';' })
 * // 输出: 'tags=vue;react&status=active'
 *
 * // 过滤 null 和 undefined 值
 * paramsSerializer({ name: 'John', age: null, city: undefined, country: 'USA' })
 * // 输出: 'name=John&country=USA'
 * ```
 *
 * @returns 序列化后的查询字符串
 */
export function paramsSerializer(
  params: ExtendableObject,
  options?: ParamsSerializerOptions,
): string {
  if (!params)
    return ''

  const format = options?.format ?? 'repeat'
  const startIndex = options?.startIndex ?? 0
  const separator = options?.separator ?? ','

  return Object.keys(params)
    .filter(key => params[key] != null)
    .map(key =>
      Array.isArray(params[key])
        ? format === 'index'
          ? params[key].map((val, i) =>
              `${encodeURIComponent(`${key}[${startIndex + i}]`)}=${encodeURIComponent(String(val))}`,
            ).join('&')
          : format === 'join'
            ? `${encodeURIComponent(key)}=${encodeURIComponent(params[key].join(separator))}`
            : params[key].map(val =>
                `${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`,
              ).join('&')
        : `${encodeURIComponent(key)}=${encodeURIComponent(String(params[key]))}`,
    )
    .join('&')
}

/**
 * 递归过滤值为 undefined 的属性/元素（仅处理 undefined，保留 null、空字符串、0 等其他值）
 *
 * @template {unknown} T - 输入值的类型，支持任意类型（自动推断或显式指定）
 * @param {T} value - 待过滤的值
 *   - 支持类型：纯对象（`{ key: any }`）、数组（`any[]`）、基础类型（`string`/`number` 等）、`FormData` 实例
 *   - 特别说明：`null` 会被保留（不属于 `undefined` 处理范围）
 * @returns {T} 过滤后的值，类型与输入一致，但移除了所有 `undefined` 相关内容：
 *   - 数组：移除 `undefined` 元素，子元素递归过滤
 *   - 对象：移除值为 `undefined` 的属性，子属性递归过滤
 *   - 其他类型：原样返回（`FormData` 实例、基础类型等）
 *
 * @example
 * // 示例1：过滤对象中的 undefined
 * const obj = { a: 1, b: undefined, c: { d: undefined, e: null } };
 * cleanUndefined(obj); // 返回 { a: 1, c: { e: null } }
 *
 * @example
 * // 示例2：过滤数组中的 undefined
 * const arr = [1, undefined, [2, undefined], null];
 * cleanUndefined(arr); // 返回 [1, [2], null]
 *
 * @example
 * // 示例3：保留 FormData
 * const formData = new FormData();
 * formData.append('file', new Blob());
 * cleanUndefined(formData); // 返回原 FormData 实例（无修改）
 *
 * @note 依赖 lodash-es 的工具函数：
 * - _isUndefined：判断值是否为 undefined（类型守卫，确保运行时类型准确）
 * - _isArray：判断值是否为数组（类型守卫，用于分支类型收窄）
 * - _omitBy：遍历对象并移除符合条件的属性（此处用于移除值为 undefined 的属性）
 */
export function cleanUndefined<T = unknown>(value: T): T {
  if (_isUndefined(value))
    return value

  // 保留 FormData（避免破坏文件上传等二进制数据）
  if (value instanceof FormData)
    return value

  // 递归处理数组
  if (_isArray(value)) {
    // 数组元素类型设为 unknown，避免 any
    return (value as unknown[])
      .map(item => cleanUndefined(item))
      .filter(item => !_isUndefined(item)) as unknown as T
  }

  // 递归处理纯对象：移除值为 undefined 的属性
  if (value !== null && typeof value === 'object') {
    return _omitBy(
      Object.fromEntries(
        Object.entries(value).map(([key, val]) => [key, cleanUndefined(val)]),
      ),
      _isUndefined,
    )
  }

  // 保留其他所有类型（null、字符串、数字、布尔等）
  return value
}
