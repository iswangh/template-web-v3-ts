import type { UserInfo } from '@/types'
import { defineStore } from 'pinia'
import { TOKEN } from '@/configs'
import { removeCookie, setAuthToken } from '@/utils'

export const useUserStore = defineStore('user', () => {
  /**
   * 用户访问令牌
   */
  const token = ref<string>('')

  /**
   * 用户信息
   */
  const userInfo = ref<UserInfo | null>(null)

  /**
   * 判断用户是否已登录
   * @returns {boolean} 如果存在有效的 token 则返回 true，否则返回 false
   */
  const isLoggedIn = computed(() => !!token.value)

  /**
   * 设置用户访问令牌
   * @param {string} newToken - 新的访问令牌
   */
  const setToken = (newToken: string) => {
    token.value = newToken
    setAuthToken(newToken)
  }

  /**
   * 设置用户信息
   * @param {UserInfo} info - 用户信息对象
   */
  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
  }

  /**
   * 用户登录操作
   *
   * 登录成功后，设置用户信息、访问令牌和登录状态。
   */
  const login = async (data: UserInfo) => {
    token.value = TOKEN
    setUserInfo(data)
  }

  /**
   * 用户登出操作
   *
   * 清除当前用户的 token 和用户信息
   */
  const logout = () => {
    token.value = ''
    userInfo.value = null
    removeCookie('token')
  }

  return { token, userInfo, isLoggedIn, setToken, setUserInfo, login, logout }
}, { persist: true })
