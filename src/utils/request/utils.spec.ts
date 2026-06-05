/**
 * request/utils 单元测试
 *
 * 覆盖 paramsSerializer 与 cleanUndefined 的核心行为。
 */

import { describe, expect, it } from 'vitest'
import { cleanUndefined, paramsSerializer } from './utils'

describe('paramsSerializer', () => {
  it('returns empty string for falsy params', () => {
    expect(paramsSerializer(null as unknown as Record<string, unknown>)).toBe('')
  })

  it('serializes repeat format by default', () => {
    const result = paramsSerializer({ tags: ['vue', 'react'], status: 'active' })
    expect(result).toBe('tags=vue&tags=react&status=active')
  })

  it('serializes index format with custom startIndex', () => {
    const result = paramsSerializer(
      { tags: ['vue', 'react'] },
      { format: 'index', startIndex: 1 },
    )
    expect(result).toBe('tags%5B1%5D=vue&tags%5B2%5D=react')
  })

  it('serializes join format with custom separator', () => {
    const result = paramsSerializer(
      { tags: ['vue', 'react'], status: 'active' },
      { format: 'join', separator: ';' },
    )
    expect(result).toBe('tags=vue%3Breact&status=active')
  })

  it('filters null and undefined values', () => {
    const result = paramsSerializer({
      name: 'John',
      age: null,
      city: undefined,
      country: 'USA',
    })
    expect(result).toBe('name=John&country=USA')
  })

  it('encodes special characters in keys and values', () => {
    const result = paramsSerializer({ 'a b': 'x&y' })
    expect(result).toBe('a%20b=x%26y')
  })
})

describe('cleanUndefined', () => {
  it('removes undefined from nested objects while preserving null', () => {
    const input = { a: 1, b: undefined, c: { d: undefined, e: null } }
    expect(cleanUndefined(input)).toEqual({ a: 1, c: { e: null } })
  })

  it('removes undefined elements from arrays recursively', () => {
    const input = [1, undefined, [2, undefined], null]
    expect(cleanUndefined(input)).toEqual([1, [2], null])
  })

  it('returns FormData instance unchanged', () => {
    const formData = new FormData()
    formData.append('file', 'blob')
    expect(cleanUndefined(formData)).toBe(formData)
  })

  it('preserves null at top level', () => {
    expect(cleanUndefined(null)).toBe(null)
  })
})
