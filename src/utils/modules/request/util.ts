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
