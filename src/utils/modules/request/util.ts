import type { SerializeOptions } from './types'
import type { ExtendableObject } from '@/types'

/**
 * 将参数对象序列化为查询字符串
 *
 * @param params - 需要序列化的参数对象
 * @param options - 序列化选项
 * @param options.format - 数组格式化策略: 'repeat' | 'index' | 'join'，默认为 'repeat'
 * @param options.startIndex - 数组索引起始值，仅在 index 模式下有效，默认为 0
 * @param options.separator - 数组元素分隔符，仅在 join 模式下有效，默认为 ','
 * @returns 序列化后的查询字符串
 */
export function serializeParams(
  params: ExtendableObject,
  options?: SerializeOptions,
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
