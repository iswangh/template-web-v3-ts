/**
 * user store 单元测试
 */

import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TOKEN } from '@/config'
import { removeCookie, setAuthToken } from '@/utils'
import { useUserStore } from './user'

vi.mock('@/utils', () => ({
  setAuthToken: vi.fn(),
  removeCookie: vi.fn(),
}))

describe('useUserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('starts logged out', () => {
    const store = useUserStore()
    expect(store.isLoggedIn).toBe(false)
    expect(store.token).toBe('')
    expect(store.userInfo).toBeNull()
  })

  it('login sets token and userInfo', async () => {
    const store = useUserStore()
    const user = { id: '1', username: 'tester', password: 'secret' }

    await store.login(user)

    expect(store.token).toBe(TOKEN)
    expect(store.userInfo).toEqual(user)
    expect(store.isLoggedIn).toBe(true)
  })

  it('setToken updates token and persists via setAuthToken', () => {
    const store = useUserStore()

    store.setToken('custom-token')

    expect(store.token).toBe('custom-token')
    expect(setAuthToken).toHaveBeenCalledWith('custom-token')
    expect(store.isLoggedIn).toBe(true)
  })

  it('logout clears state and removes cookie', () => {
    const store = useUserStore()
    store.setToken('custom-token')
    store.setUserInfo({ id: '1', username: 'tester', password: '' })

    store.logout()

    expect(store.token).toBe('')
    expect(store.userInfo).toBeNull()
    expect(store.isLoggedIn).toBe(false)
    expect(removeCookie).toHaveBeenCalledWith('token')
  })
})
