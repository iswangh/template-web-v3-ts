/**
 * cookies 工具单元测试
 */

import Cookies from 'js-cookie'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAuthToken, getCookie, removeCookie, setAuthToken, setCookie } from './cookies'

vi.mock('js-cookie', () => ({
  default: {
    set: vi.fn(),
    get: vi.fn(),
    remove: vi.fn(),
  },
}))

describe('setCookie / getCookie', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('setCookie encodes value and merges default options', () => {
    setCookie('session', 'hello world', 3)

    expect(Cookies.set).toHaveBeenCalledWith(
      'session',
      encodeURIComponent('hello world'),
      expect.objectContaining({
        expires: 3,
        path: '/',
        sameSite: 'strict',
      }),
    )
  })

  it('getCookie decodes stored value', () => {
    vi.mocked(Cookies.get).mockReturnValue(encodeURIComponent('hello world'))

    expect(getCookie('session')).toBe('hello world')
  })

  it('getCookie returns null when missing', () => {
    vi.mocked(Cookies.get).mockReturnValue(undefined)

    expect(getCookie('missing')).toBeNull()
  })

  it('removeCookie uses default path', () => {
    removeCookie('token')

    expect(Cookies.remove).toHaveBeenCalledWith('token', { path: '/' })
  })
})

describe('setAuthToken / getAuthToken', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-05T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('uses fallback expires in days when backend expires is absent', () => {
    setAuthToken('abc-token')

    expect(Cookies.set).toHaveBeenCalledWith(
      'token',
      encodeURIComponent('abc-token'),
      expect.objectContaining({ expires: 7 }),
    )
    expect(getAuthToken()).toBeNull()
  })

  it('converts backend seconds to days with minimum of 1 day', () => {
    setAuthToken('abc-token', 86_400)

    expect(Cookies.set).toHaveBeenCalledWith(
      'token',
      encodeURIComponent('abc-token'),
      expect.objectContaining({ expires: 1 }),
    )
  })

  it('treats non-positive backend seconds as fallback days', () => {
    setAuthToken('abc-token', 0)

    expect(Cookies.set).toHaveBeenCalledWith(
      'token',
      encodeURIComponent('abc-token'),
      expect.objectContaining({ expires: 7 }),
    )
  })
})
