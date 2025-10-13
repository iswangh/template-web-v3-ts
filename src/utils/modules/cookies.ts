import dayjs from 'dayjs'
import Cookies from 'js-cookie'

/**
 * 设置 Cookie
 * @param {string} key - Cookie 键名
 * @param {string} value - Cookie 值
 * @param {number} [expires] - 过期时间（单位：天）
 * @param {object} [options] - 额外配置（如 path, secure 等，会与默认配置合并）
 */
export function setCookie(
  key: string,
  value: string,
  expires = 7,
  options: Cookies.CookieAttributes = {},
) {
  // 默认配置（优先级：参数 options > 默认配置）
  const defaultOptions: Cookies.CookieAttributes = {
    expires,
    path: '/',
    secure: import.meta.env.VITE_COOKIE_SECURE === 'true',
    sameSite: 'strict',
  }

  // 合并配置（用户传入的 options 会覆盖默认配置）
  const finalOptions = { ...defaultOptions, ...options }

  // 编码后存储
  Cookies.set(key, encodeURIComponent(value), finalOptions)
}

/**
 * 获取 Cookie
 * @param {string} key - Cookie 键名
 * @returns {string | null} 解码后的 Cookie 值，不存在则返回 null
 */
export function getCookie(key: string): string | null {
  const value = Cookies.get(key)
  return value ? decodeURIComponent(value) : null
}

/**
 * 删除 Cookie
 * @param {string} key - Cookie 键名
 * @param {object} [options] - 与设置时一致的额外配置（如 path）
 */
export function removeCookie(key: string, options: Cookies.CookieAttributes = {}) {
  Cookies.remove(key, {
    path: '/', // 默认路径，与设置时保持一致
    ...options,
  })
}

/**
 * 将秒数转换为天数（使用 dayjs 确保精确性）
 * @param {number} seconds - 秒数
 * @returns {number} 转换后的天数
 */
function secondsToDays(seconds: number): number {
  // 避免负数导致的异常
  if (seconds <= 0)
    return 0

  // 计算从现在开始，经过指定秒数后的日期
  const targetDate = dayjs().add(seconds, 'second')

  // 计算与当前日期的天数差
  return targetDate.diff(dayjs(), 'day')
}

/**
 * 设置认证 token（封装了通用 setCookie，键固定为 'token'）
 * @param {string} token - 后端返回的 token
 * @param {number} [backendExpiresIn] - 后端返回的有效期（单位：秒）
 * @param {number} [fallbackExpires] - 后端未返回时的 fallback 有效期（单位：天）
 */
export function setAuthToken(
  token: string,
  backendExpiresIn?: number,
  fallbackExpires = 7,
) {
  // 获取有效期（单位：天）,确保有效期至少为1天，防止瞬间过期
  const expires = backendExpiresIn ? Math.max(secondsToDays(backendExpiresIn), 1) : fallbackExpires

  setCookie('token', token, expires)
}

/**
 * 获取认证 token（封装了通用 getCookie，键固定为 'token'）
 * @returns {string | null} token 字符串或 null
 */
export function getAuthToken(): string | null {
  return getCookie('token')
}

/**
 * 删除认证 token（封装了通用 removeCookie，键固定为 'token'）
 */
export function removeAuthToken() {
  removeCookie('token')
}
