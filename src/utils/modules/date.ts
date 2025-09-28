import type { Dayjs, ManipulateType, OpUnitType } from 'dayjs'
import type { Duration, DurationUnitType } from 'dayjs/plugin/duration'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import duration from 'dayjs/plugin/duration'
import isBetween from 'dayjs/plugin/isBetween'
import isLeapYear from 'dayjs/plugin/isLeapYear'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isToday from 'dayjs/plugin/isToday'
import isTomorrow from 'dayjs/plugin/isTomorrow'
import isYesterday from 'dayjs/plugin/isYesterday'
import localeData from 'dayjs/plugin/localeData'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import relativeTime from 'dayjs/plugin/relativeTime'
import weekday from 'dayjs/plugin/weekday'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import weekYear from 'dayjs/plugin/weekYear'
import 'dayjs/locale/zh-cn'

dayjs.extend(customParseFormat)
dayjs.extend(duration)
dayjs.extend(isLeapYear)
dayjs.extend(localeData)
dayjs.extend(relativeTime)
dayjs.extend(weekday)
dayjs.extend(weekOfYear)
dayjs.extend(weekYear)
dayjs.extend(quarterOfYear)
dayjs.extend(isToday)
dayjs.extend(isYesterday)
dayjs.extend(isTomorrow)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)
dayjs.extend(isBetween)

dayjs.locale('zh-cn')

/**
 * 常用日期格式常量（统一管理，避免硬编码）
 */
export const DATE_FORMAT = {
  CHINESE_DATE: 'YYYY年MM月DD日',
  YEAR_MONTH: 'YYYY年MM月',
  MONTH_DAY: 'MM月DD日',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  HOUR_MINUTE: 'HH:mm',
  YEAR: 'YYYY',
  MONTH: 'MM',
  WEEK: 'dddd',
} as const

/** 导出 dayjs 核心类型，供业务直接使用 */
export type { Dayjs } from 'dayjs'

/**
 * 日期输入支持的类型（覆盖常见日期传入场景）
 */
export type DateInput = string | number | Date | Dayjs | null | undefined

/**
 * 时长拆分结果的类型定义（按天、时、分、秒、毫秒拆分）
 * @property {number} days - 天数（>=0）
 * @property {number} hours - 小时数（0-23）
 * @property {number} minutes - 分钟数（0-59）
 * @property {number} seconds - 秒数（0-59）
 * @property {number} milliseconds - 毫秒数（0-999）
 */
export interface DurationSplitResult {
  days: number
  hours: number
  minutes: number
  seconds: number
  milliseconds: number
}

/**
 * 下一个生日信息的返回类型
 * @interface NextBirthdayResult
 * @property {Dayjs} date - 下一个生日的 Dayjs 实例
 * @property {number} days - 距离下一个生日的天数（正数）
 * @property {(format?: string) => string} format - 快捷格式化方法（默认中文日期格式）
 */
export interface NextBirthdayResult {
  date: Dayjs
  days: number
  format: (format?: string) => string
}

/**
 * 日期差值计算的返回类型（多单位精确展示）
 * @interface DateDiffResult
 * @property {number} years - 年差值
 * @property {number} months - 月差值（0-11）
 * @property {number} days - 天差值（0-29，简化处理）
 * @property {number} hours - 小时差值（0-23）
 * @property {number} minutes - 分钟差值（0-59）
 * @property {number} seconds - 秒差值（0-59）
 */
export interface DateDiffResult {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

/**
 * 日期工具类（封装高频日期操作，处理无效日期边界）
 * @namespace dateUtil
 */
export const dateUtil = {
  /**
   * 私有辅助函数：统一获取有效 Dayjs 实例（内部使用，不对外暴露）
   * @param {DateInput} date - 待处理的日期输入
   * @returns {Dayjs} 有效则返回 Dayjs 实例，无效则返回 dayjs(null)
   */
  _getValidDayjs: (date: DateInput): Dayjs => {
  // 1. 处理空输入
    if (date == null || (typeof date === 'string' && date.trim() === '')) {
      console.warn(`[dateUtil] 无效日期：空输入（已处理为无效实例）`)
      return dayjs(null)
    }
    // 2. 已为 Dayjs 实例
    if (dayjs.isDayjs(date))
      return date
    // 3. 格式错误
    const day = dayjs(date)
    if (!day.isValid())
      console.warn(`[dateUtil] 无效日期：格式错误（输入：${JSON.stringify(date)}，已处理为无效实例）`)
    return day
  },

  /**
   * 获取原始 dayjs 实例（供特殊场景使用，如调用未封装的原生方法）
   * @returns {typeof dayjs} dayjs 核心函数
   * @example
   * const isLeap = dateUtil.raw()('2024').isLeapYear() // true
   */
  raw: (): typeof dayjs => dayjs,

  /**
   * 获取当前时间的 Dayjs 实例
   * @returns {Dayjs} 当前时间的 Dayjs 实例
   * @example
   * const now = dateUtil.now() // 2024-09-18T15:30:00+08:00（Dayjs 实例）
   */
  now: (): Dayjs => dayjs(),

  /**
   * 格式化日期（无效日期返回空字符串，避免展示异常）
   * @param {DateInput} date - 待格式化的日期
   * @param {string} [format] - 格式化模板
   * @returns {string} 格式化后的日期字符串，无效日期返回空
   * @example
   * dateUtil.format('2024-09-18') // "2024-09-18 00:00:00"
   */
  format: (date: DateInput, format: string = DATE_FORMAT.DATETIME): string => {
    const validDay = dateUtil._getValidDayjs(date)
    return validDay.isValid() ? validDay.format(format) : ''
  },

  /**
   * 按指定时区格式化日期（默认 UTC+8 东八区，无效日期返回空）
   * @param {DateInput} date - 待格式化的日期
   * @param {string} [format] - 格式化模板
   * @param {string} [timezone] - 目标时区（支持 ±HH:mm 格式）
   * @returns {string} 时区格式化后的字符串，无效日期返回空
   * @example
   * dateUtil.formatWithTimezone('2024-09-18T07:30:00Z') // "2024-09-18 15:30:00"
   */
  formatWithTimezone: (
    date: DateInput,
    format: string = DATE_FORMAT.DATETIME,
    timezone: string = '+08:00',
  ): string => {
    const validDay = dateUtil._getValidDayjs(date)
    return validDay.isValid() ? validDay.format(`${format}[${timezone}]`).replace(`[${timezone}]`, '') : ''
  },

  /**
   * 获取相对时间（如“3小时前”“2天后”，无效日期返回空字符串）
   * @param {DateInput} date - 待计算的日期
   * @param {boolean} [withoutSuffix] - 是否隐藏后缀
   * @returns {string} 相对时间字符串，无效日期返回空
   * @example
   * dateUtil.fromNow('2024-09-18 10:00') // "5小时前"（假设当前15:00）
   */
  fromNow: (date: DateInput, withoutSuffix: boolean = false): string => {
    const validDay = dateUtil._getValidDayjs(date)
    return validDay.isValid() ? validDay.fromNow(withoutSuffix) : ''
  },

  /**
   * 计算两个日期的差值（多单位展示，无效日期返回全 0）
   * @param {DateInput} start - 开始日期
   * @param {DateInput} [end] - 结束日期（默认当前时间）
   * @returns {DateDiffResult} 多单位差值结果，无效日期返回全 0
   * @example
   * const diff = dateUtil.diff('2024-01-01', '2024-09-18')
   * // { years:0, months:8, days:17, hours:0, minutes:0, seconds:0 }
   */
  diff: (start: DateInput, end: DateInput = dateUtil.now()): DateDiffResult => {
    const startDay = dateUtil._getValidDayjs(start)
    const endDay = dateUtil._getValidDayjs(end)
    if (!startDay.isValid() || !endDay.isValid()) {
      return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    const [early, late] = endDay.isAfter(startDay) ? [startDay, endDay] : [endDay, startDay]
    // 分步计算，避免月份天数差异导致的误差
    const years = late.diff(early, 'year')
    const earlyAfterYear = early.add(years, 'year')

    const months = late.diff(earlyAfterYear, 'month')
    const earlyAfterMonth = earlyAfterYear.add(months, 'month')

    const days = late.diff(earlyAfterMonth, 'day')
    const earlyAfterDay = earlyAfterMonth.add(days, 'day')

    const hours = late.diff(earlyAfterDay, 'hour')
    const earlyAfterHour = earlyAfterDay.add(hours, 'hour')

    const minutes = late.diff(earlyAfterHour, 'minute')
    const seconds = late.diff(earlyAfterHour.add(minutes, 'minute'), 'second')

    return { years, months, days, hours, minutes, seconds }
  },

  /**
   * 为日期增加指定时间（无效日期返回当前时间）
   * @param {DateInput} date - 基础日期
   * @param {number} value - 增加的值
   * @param {ManipulateType} [unit] - 单位（如 'day'/'month'/'year'）
   * @returns {Dayjs} 增加后的日期实例
   * @example
   * dateUtil.add(dateUtil.now(), 3, 'day').format(DATE_FORMAT.DATE) // 今天+3天
   */
  add: (
    date: DateInput,
    value: number,
    unit: ManipulateType = 'day',
  ): Dayjs => {
    return dateUtil._getValidDayjs(date).add(value, unit)
  },

  /**
   * 为日期减少指定时间（无效日期返回当前时间）
   * @param {DateInput} date - 基础日期
   * @param {number} value - 减少的值
   * @param {ManipulateType} [unit] - 单位（如 'day'/'month'/'year'）
   * @returns {Dayjs} 减少后的日期实例
   * @example
   * dateUtil.subtract(dateUtil.now(), 1, 'month').format(DATE_FORMAT.DATE) // 今天-1月
   */
  subtract: (
    date: DateInput,
    value: number,
    unit: ManipulateType = 'day',
  ): Dayjs => {
    return dateUtil._getValidDayjs(date).subtract(value, unit)
  },

  /**
   * 获取指定时间单位的开始（如当天 00:00:00，无效日期返回当前时间的开始）
   * @param {DateInput} date - 基础日期
   * @param {OpUnitType} [unit] - 单位（如 'day'/'month'/'year'）
   * @returns {Dayjs} 单位开始的日期实例
   * @example
   * dateUtil.startOf(dateUtil.now(), 'day').format(DATE_FORMAT.DATETIME) // "2024-09-18 00:00:00"
   */
  startOf: (date: DateInput, unit: OpUnitType = 'day'): Dayjs => {
    return dateUtil._getValidDayjs(date).startOf(unit)
  },

  /**
   * 获取指定时间单位的结束（如当天 23:59:59，无效日期返回当前时间的结束）
   * @param {DateInput} date - 基础日期
   * @param {OpUnitType} [unit] - 单位（如 'day'/'month'/'year'）
   * @returns {Dayjs} 单位结束的日期实例
   * @example
   * dateUtil.endOf(dateUtil.now(), 'month').format(DATE_FORMAT.DATETIME) // "2024-09-30 23:59:59"
   */
  endOf: (date: DateInput, unit: OpUnitType = 'day'): Dayjs => {
    return dateUtil._getValidDayjs(date).endOf(unit)
  },

  /**
   * 获取指定日期所在月的第一天（无效日期返回当前月第一天）
   * @param {DateInput} [date] - 参考日期（默认当前时间）
   * @returns {Dayjs} 当月第一天的 Dayjs 实例
   * @example
   * dateUtil.monthFirstDay('2024-09-18').format(DATE_FORMAT.DATE) // "2024-09-01"
   */
  monthFirstDay: (date: DateInput = dateUtil.now()): Dayjs => {
    return dateUtil._getValidDayjs(date).startOf('month')
  },

  /**
   * 获取指定日期所在月的最后一天（无效日期返回当前月最后一天）
   * @param {DateInput} [date] - 参考日期（默认当前时间）
   * @returns {Dayjs} 当月最后一天的 Dayjs 实例
   * @example
   * dateUtil.monthLastDay('2024-09-18').format(DATE_FORMAT.DATE) // "2024-09-30"
   */
  monthLastDay: (date: DateInput = dateUtil.now()): Dayjs => {
    return dateUtil._getValidDayjs(date).endOf('month')
  },

  /**
   * 获取日期的年份（无效日期返回当前年份）
   * @param {DateInput} [date] - 参考日期（默认当前时间）
   * @returns {number} 年份（如 2024）
   * @example
   * dateUtil.year('2024-09-18') // 2024
   */
  year: (date: DateInput = dateUtil.now()): number => {
    return dateUtil._getValidDayjs(date).year()
  },

  /**
   * 获取日期的月份（1-12，无效日期返回当前月份）
   * @param {DateInput} [date] - 参考日期（默认当前时间）
   * @returns {number} 月份（1-12）
   * @example
   * dateUtil.month('2024-09-18') // 9
   */
  month: (date: DateInput = dateUtil.now()): number => {
    return dateUtil._getValidDayjs(date).month() + 1 // dayjs默认0-11，转为1-12
  },

  /**
   * 获取日期是几号（1-31，无效日期返回 -1）
   * @param {DateInput} [date] - 参考日期（默认当前时间）
   * @returns {number} 几号（1-31），无效日期返回 -1
   * @example
   * dateUtil.dayOfMonth('2024-09-18') // 18
   */
  dayOfMonth: (date: DateInput = dateUtil.now()): number => {
    const day = dateUtil._getValidDayjs(date)
    return day.isValid() ? day.date() : -1
  },

  /**
   * 获取日期是周几（0-6，0=周日，无效日期返回 -1）
   * @param {DateInput} [date] - 参考日期（默认当前时间）
   * @returns {number} 周几（0-6），无效日期返回 -1
   * @example
   * dateUtil.dayOfWeek('2024-09-18') // 3（周三）
   */
  dayOfWeek: (date: DateInput = dateUtil.now()): number => {
    const day = dateUtil._getValidDayjs(date)
    return day.isValid() ? day.day() : -1
  },

  /**
   * 获取指定月份的天数（无效日期返回当前月天数）
   * @param {DateInput} [date] - 参考日期（默认当前时间）
   * @returns {number} 月份天数（28-31）
   * @example
   * dateUtil.daysInMonth('2024-02-01') // 29（2024是闰年）
   */
  daysInMonth: (date: DateInput = dateUtil.now()): number => {
    return dateUtil._getValidDayjs(date).daysInMonth()
  },

  /**
   * 获取日期所在周数（1-53，无效日期返回当前周数）
   * @param {DateInput} [date] - 参考日期（默认当前时间）
   * @returns {number} 周数（1-53）
   * @example
   * dateUtil.week('2024-01-01') // 1（2024年第一周）
   */
  week: (date: DateInput = dateUtil.now()): number => {
    return dateUtil._getValidDayjs(date).week()
  },

  /**
   * 获取日期所在季度（1-4，无效日期返回当前季度）
   * @param {DateInput} [date] - 参考日期（默认当前时间）
   * @returns {number} 季度数（1-4）
   * @example
   * dateUtil.quarter('2024-03-15') // 1（第一季度）
   */
  quarter: (date: DateInput = dateUtil.now()): number => {
    return dateUtil._getValidDayjs(date).quarter()
  },

  /**
   * 判断日期是否为今天（无效日期返回 false）
   * @param {DateInput} date - 待判断的日期
   * @returns {boolean} 是今天返回 true，否则返回 false
   * @example
   * dateUtil.isToday('2024-09-18') // true（当前2024-09-18）
   */
  isToday: (date: DateInput): boolean => {
    return dateUtil._getValidDayjs(date).isToday()
  },

  /**
   * 判断日期是否为昨天（无效日期返回 false）
   * @param {DateInput} date - 待判断的日期
   * @returns {boolean} 是昨天返回 true，否则返回 false
   * @example
   * dateUtil.isYesterday('2024-09-17') // true（当前2024-09-18）
   */
  isYesterday: (date: DateInput): boolean => {
    return dateUtil._getValidDayjs(date).isYesterday()
  },

  /**
   * 判断日期是否为明天（无效日期返回 false）
   * @param {DateInput} dateInput - 待判断的日期
   * @returns {boolean} 是明天返回 true，否则返回 false
   * @example
   * dateUtil.isTomorrow('2024-09-19') // true（当前2024-09-18）
   */
  isTomorrow: (dateInput: DateInput): boolean => {
    return dateUtil._getValidDayjs(dateInput).isTomorrow()
  },

  /**
   * 判断日期是否为周末（周日=0，周六=6，无效日期返回 false）
   * @param {DateInput} date - 待判断的日期
   * @returns {boolean} 是周末返回 true，否则返回 false
   * @example
   * dateUtil.isWeekend('2024-09-22') // true（周日）
   */
  isWeekend: (date: DateInput): boolean => {
    const day = dateUtil._getValidDayjs(date).day()
    return day === 0 || day === 6
  },

  /**
   * 判断两个日期是否为同一天（无效日期返回 false）
   * @param {DateInput} date1 - 第一个日期
   * @param {DateInput} [date2] - 第二个日期（默认当前时间）
   * @returns {boolean} 是同一天返回 true，否则返回 false
   * @example
   * dateUtil.isSameDay('2024-09-18 08:00', '2024-09-18 20:00') // true
   */
  isSameDay: (date1: DateInput, date2: DateInput = dateUtil.now()): boolean => {
    const day1 = dateUtil._getValidDayjs(date1)
    const day2 = dateUtil._getValidDayjs(date2)
    return day1.isValid() && day2.isValid() && day1.isSame(day2, 'day')
  },

  /**
   * 判断两个日期是否为同一周（无效日期返回 false）
   * @param {DateInput} date1 - 第一个日期
   * @param {DateInput} [date2] - 第二个日期（默认当前时间）
   * @returns {boolean} 是同一周返回 true，否则返回 false
   * @example
   * dateUtil.isSameWeek('2024-09-16', '2024-09-22') // true（同一周）
   */
  isSameWeek: (date1: DateInput, date2: DateInput = dateUtil.now()): boolean => {
    const day1 = dateUtil._getValidDayjs(date1)
    const day2 = dateUtil._getValidDayjs(date2)
    return day1.isValid() && day2.isValid() && day1.isSame(day2, 'week')
  },

  /**
   * 判断两个日期是否为同一月（无效日期返回 false）
   * @param {DateInput} date1 - 第一个日期
   * @param {DateInput} [date2] - 第二个日期（默认当前时间）
   * @returns {boolean} 是同一月返回 true，否则返回 false
   * @example
   * dateUtil.isSameMonth('2024-09-01', '2024-09-30') // true
   */
  isSameMonth: (date1: DateInput, date2: DateInput = dateUtil.now()): boolean => {
    const day1 = dateUtil._getValidDayjs(date1)
    const day2 = dateUtil._getValidDayjs(date2)
    return day1.isValid() && day2.isValid() && day1.isSame(day2, 'month')
  },

  /**
   * 判断两个日期是否为同一年（无效日期返回 false）
   * @param {DateInput} date1 - 第一个日期
   * @param {DateInput} [date2] - 第二个日期（默认当前时间）
   * @returns {boolean} 是同一年返回 true，否则返回 false
   * @example
   * dateUtil.isSameYear('2024-01-01', '2024-12-31') // true
   */
  isSameYear: (date1: DateInput, date2: DateInput = dateUtil.now()): boolean => {
    const day1 = dateUtil._getValidDayjs(date1)
    const day2 = dateUtil._getValidDayjs(date2)
    return day1.isValid() && day2.isValid() && day1.isSame(day2, 'year')
  },

  /**
   * 判断 date1 是否在 date2 之前（无效日期返回 false）
   * @param {DateInput} date1 - 待比较的日期
   * @param {DateInput} [date2] - 参考日期（默认当前时间）
   * @param {OpUnitType} [unit] - 比较单位（如 'day'/'month'）
   * @returns {boolean} date1 在 date2 之前返回 true，否则返回 false
   * @example
   * dateUtil.isBefore('2024-09-17', '2024-09-18') // true
   */
  isBefore: (
    date1: DateInput,
    date2: DateInput = dateUtil.now(),
    unit?: OpUnitType,
  ): boolean => {
    const day1 = dateUtil._getValidDayjs(date1)
    const day2 = dateUtil._getValidDayjs(date2)
    return day1.isValid() && day2.isValid() && day1.isBefore(day2, unit)
  },

  /**
   * 判断 date1 是否在 date2 之后（无效日期返回 false）
   * @param {DateInput} date1 - 待比较的日期
   * @param {DateInput} [date2] - 参考日期（默认当前时间）
   * @param {OpUnitType} [unit] - 比较单位（如 'day'/'month'）
   * @returns {boolean} date1 在 date2 之后返回 true，否则返回 false
   * @example
   * dateUtil.isAfter('2024-09-19', '2024-09-18') // true
   */
  isAfter: (
    date1: DateInput,
    date2: DateInput = dateUtil.now(),
    unit?: OpUnitType,
  ): boolean => {
    const day1 = dateUtil._getValidDayjs(date1)
    const day2 = dateUtil._getValidDayjs(date2)
    return day1.isValid() && day2.isValid() && day1.isAfter(day2, unit)
  },

  /**
   * 判断日期是否在 [start, end] 范围内（无效日期返回 false）
   * @param {DateInput} date - 待判断的日期
   * @param {DateInput} start - 范围开始日期
   * @param {DateInput} end - 范围结束日期
   * @param {OpUnitType} [unit] - 比较单位（如 'day'/'month'）
   * @returns {boolean} 在范围内返回 true，否则返回 false
   * @example
   * dateUtil.isBetween('2024-09-15', '2024-09-10', '2024-09-20') // true
   */
  isBetween: (
    date: DateInput,
    start: DateInput,
    end: DateInput,
    unit?: OpUnitType,
  ): boolean => {
    const day = dateUtil._getValidDayjs(date)
    const startDay = dateUtil._getValidDayjs(start)
    const endDay = dateUtil._getValidDayjs(end)
    return day.isValid() && startDay.isValid() && endDay.isValid() && day.isBetween(startDay, endDay, unit)
  },

  /**
   * 创建时长实例（基于毫秒数）
   * @param {number} ms - 毫秒数
   * @returns {Duration} 时长实例
   * @example
   * const dur = dateUtil.createDuration(3600000) // 1小时（3600000毫秒）
   */
  createDuration: (ms: number): Duration => {
    return dayjs.duration(ms)
  },

  /**
   * 计算两个日期的时长差（返回Duration实例，支持进一步运算）
   * @param {DateInput} start - 开始日期
   * @param {DateInput} [end] - 结束日期（默认当前时间）
   * @returns {Duration | null} 时长实例（无效日期返回null）
   * @example
   * const diff = dateUtil.getDuration('2024-09-18 08:00', '2024-09-18 10:30')
   * diff?.asHours() // 2.5（小时）
   */
  getDuration: (start: DateInput, end: DateInput = dateUtil.now()): Duration | null => {
    const startDay = dateUtil._getValidDayjs(start)
    const endDay = dateUtil._getValidDayjs(end)
    if (!startDay.isValid() || !endDay.isValid()) {
      console.warn('[dateUtil] 无效日期输入，无法计算时长差')
      return null
    }
    const msDiff = endDay.diff(startDay)
    return dayjs.duration(msDiff)
  },

  /**
   * 格式化时长为友好字符串（如 "2小时30分钟"、"1天5小时"）
   * @param {Duration | number} duration - 时长实例或毫秒数
   * @param {number} [maxUnits] - 最多显示的单位数量（避免过长）
   * @returns {string} 格式化后的时长字符串
   * @example
   * // 2小时30分钟
   * dateUtil.formatDuration(dateUtil.getDuration('08:00', '10:30'))
   * // 1天5小时
   * dateUtil.formatDuration(104400000) // 104400000毫秒 = 1天5小时
   */
  formatDuration: (duration: Duration | number, maxUnits: number = 2): string => {
    const dur = typeof duration === 'number' ? dayjs.duration(duration) : duration

    if (dur.asMilliseconds() === 0 && typeof duration !== 'number')
      return '0分钟'

    // 定义单位优先级（从大到小）
    const units = [
      { unit: 'day', label: '天', value: dur.days() },
      { unit: 'hour', label: '小时', value: dur.hours() },
      { unit: 'minute', label: '分钟', value: dur.minutes() },
      { unit: 'second', label: '秒', value: dur.seconds() },
    ].filter(item => item.value > 0) // 过滤掉值为0的单位

    // 不足maxUnits时补充更小的单位（至少显示1个单位）
    const displayUnits = units.length > 0
      ? units.slice(0, Math.min(maxUnits, units.length))
      : [{ unit: 'minute', label: '分钟', value: 0 }]

    return displayUnits.map(item => `${item.value}${item.label}`).join('')
  },

  /**
   * 时长相加（如 1小时 + 30分钟 = 1.5小时）
   * @param {Duration | number} dur1 - 第一个时长（实例或毫秒）
   * @param {Duration | number} dur2 - 第二个时长（实例或毫秒）
   * @returns {Duration} 相加后的时长实例
   * @example
   * const dur1 = dateUtil.createDuration(3600000) // 1小时
   * const dur2 = 1800000 // 30分钟
   * dateUtil.addDuration(dur1, dur2).asHours() // 1.5
   */
  addDuration: (dur1: Duration | number, dur2: Duration | number): Duration => {
    const d1 = typeof dur1 === 'number' ? dayjs.duration(dur1) : dur1
    const d2 = typeof dur2 === 'number' ? dayjs.duration(dur2) : dur2
    return d1.add(d2)
  },

  /**
   * 时长相减（如 2小时 - 30分钟 = 1.5小时）
   * @param {Duration | number} dur1 - 被减数时长（实例或毫秒）
   * @param {Duration | number} dur2 - 减数时长（实例或毫秒）
   * @returns {Duration} 相减后的时长实例（不会出现负值，最小为0）
   * @example
   * const dur1 = dateUtil.createDuration(7200000) // 2小时
   * const dur2 = 1800000 // 30分钟
   * dateUtil.subtractDuration(dur1, dur2).asHours() // 1.5
   */
  subtractDuration: (dur1: Duration | number, dur2: Duration | number): Duration => {
    const d1 = typeof dur1 === 'number' ? dayjs.duration(dur1) : dur1
    const d2 = typeof dur2 === 'number' ? dayjs.duration(dur2) : dur2
    const resultMs = d1.asMilliseconds() - d2.asMilliseconds()
    return dayjs.duration(Math.max(0, resultMs)) // 确保非负
  },

  /**
   * 将时长转换为指定单位的数值（如 90分钟 → 1.5小时）
   * @param {Duration | number} duration - 时长实例或毫秒数
   * @param {DurationUnitType} unit - 目标单位（如 'hour'/'minute'/'second'）
   * @returns {number} 转换后的数值
   * @example
   * dateUtil.durationToUnit(900000, 'minute') // 15（900000毫秒 = 15分钟）
   */
  durationToUnit: (duration: Duration | number, unit: DurationUnitType): number => {
    const dur = typeof duration === 'number' ? dayjs.duration(duration) : duration
    return dur.as(unit)
  },

  /**
   * 判断时长是否大于目标时长
   * @param {Duration | number} dur1 - 待比较的时长
   * @param {Duration | number} dur2 - 目标时长
   * @returns {boolean} dur1 > dur2 则返回true
   * @example
   * dateUtil.isDurationGreater(3600000, 1800000) // true（1小时 > 30分钟）
   */
  isDurationGreater: (dur1: Duration | number, dur2: Duration | number): boolean => {
    const ms1 = typeof dur1 === 'number' ? dur1 : dur1.asMilliseconds()
    const ms2 = typeof dur2 === 'number' ? dur2 : dur2.asMilliseconds()
    return ms1 > ms2
  },

  /**
   * 计算年龄（精确到“是否过了当年生日”，无效生日返回 0）
   * @param {DateInput} birthday - 生日日期
   * @returns {number} 计算后的年龄，无效生日返回 0
   * @example
   * dateUtil.age('2000-05-20') // 24（当前2024-09-18，已过生日）
   */
  age: (birthday: DateInput): number => {
    const birthdayDay = dateUtil._getValidDayjs(birthday)
    if (!birthdayDay.isValid())
      return 0

    const current = dateUtil.now()
    let age = current.diff(birthdayDay, 'year')
    if (current.isBefore(birthdayDay.add(age, 'year')))
      age--
    return age
  },

  /**
   * 获取下一个生日的详细信息（无效生日返回 null）
   * @param {DateInput} birthday - 生日日期
   * @returns {NextBirthdayResult | null} 下一个生日信息，无效生日返回 null
   * @example
   * const next = dateUtil.nextBirthday('2000-12-30') // 当前2024-09-18
   * next?.days // 104（距离12-30的天数）
   */
  nextBirthday: (birthday: DateInput): NextBirthdayResult | null => {
    const birthdayDay = dateUtil._getValidDayjs(birthday)
    if (!birthdayDay.isValid())
      return null

    const current = dateUtil.now()
    const age = current.diff(birthdayDay, 'year')
    let next = birthdayDay.add(age + 1, 'year')
    if (current.isAfter(next))
      next = next.add(1, 'year')

    return {
      date: next,
      days: next.diff(current, 'day'),
      format: (format = DATE_FORMAT.CHINESE_DATE) => next.format(format),
    }
  },
}

// 导出初始化后的 dayjs 实例（供特殊场景直接使用）
export default dayjs
