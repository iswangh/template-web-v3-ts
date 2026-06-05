/**
 * dateUtil 单元测试
 *
 * 覆盖高频 format 与无效日期处理，不穷举全部工具方法。
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DATE_FORMAT, dateUtil } from './date'

describe('dateUtil.format', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('formats valid date strings with default datetime pattern', () => {
    expect(dateUtil.format('2024-09-18')).toBe('2024-09-18 00:00:00')
  })

  it('formats with custom pattern', () => {
    expect(dateUtil.format('2024-09-18', DATE_FORMAT.DATE)).toBe('2024-09-18')
  })

  it('returns empty string for invalid dates', () => {
    expect(dateUtil.format('not-a-date')).toBe('')
    expect(dateUtil.format('')).toBe('')
    expect(dateUtil.format(null)).toBe('')
  })
})

describe('dateUtil.fromNow', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-09-18T15:00:00'))
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('returns relative time for valid dates', () => {
    expect(dateUtil.fromNow('2024-09-18 10:00')).toContain('小时前')
  })

  it('returns empty string for invalid dates', () => {
    expect(dateUtil.fromNow('invalid')).toBe('')
  })
})

describe('dateUtil.diff', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns zeroed result for invalid input', () => {
    expect(dateUtil.diff('bad', '2024-01-01')).toEqual({
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    })
  })

  it('calculates difference between two valid dates', () => {
    const result = dateUtil.diff('2024-01-01', '2024-03-01')
    expect(result.months).toBeGreaterThanOrEqual(1)
  })
})

describe('dateUtil.now', () => {
  it('returns current dayjs instance', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-09-18T12:00:00'))

    expect(dateUtil.format(dateUtil.now(), DATE_FORMAT.DATETIME)).toBe('2024-09-18 12:00:00')

    vi.useRealTimers()
  })
})
