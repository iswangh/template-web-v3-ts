/**
 * 认证与路由 E2E 测试
 *
 * 验证未登录拦截、登录页展示及 mock 登录后进管理端；依赖 stores/user 本地登录态，无真实后端。
 */

import { expect, test } from '@playwright/test'

/** 与 .env 中 VITE_APP_NAME 一致，用于断言登录页标题 */
const APP_NAME = 'template-web-v3-ts'

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login')

  const username = page.getByRole('textbox', { name: '用户名' })
  const password = page.getByRole('textbox', { name: '密码' })

  await username.fill('testuser')
  await password.fill('password123')
  await expect(username).toHaveValue('testuser')
  await expect(password).toHaveValue('password123')

  await page.getByRole('button', { name: '登录' }).click()
  await page.waitForURL(/\/admin$/, { timeout: 15_000 })
}

test.describe('认证与路由', () => {
  test('未登录访问首页会跳转到登录页', async ({ page }) => {
    // 根路由 requiresAuth，守卫应重定向到 /login 并带上 redirect 参数
    await page.goto('/')
    await expect(page).toHaveURL(/\/login(\?redirect=.*)?$/)
  })

  test('登录页展示应用名称', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(APP_NAME)
  })

  test('登录成功后进入管理端首页', async ({ page }) => {
    await login(page)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('管理端首页')
  })

  test('注册页可访问', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(APP_NAME)
    await expect(page.getByText('创建新账户')).toBeVisible()
  })

  test('忘记密码页可访问', async ({ page }) => {
    await page.goto('/forgot-password')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(APP_NAME)
    await expect(page.getByText('找回密码')).toBeVisible()
    await expect(page.getByRole('link', { name: '返回登录' })).toBeVisible()
  })

  test('未登录访问受保护页会携带 redirect 参数', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/login\?redirect=\/admin/)
  })

  test('携带 redirect 参数登录后进入管理端', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/login\?redirect=/)

    await page.getByRole('textbox', { name: '用户名' }).fill('testuser')
    await page.getByRole('textbox', { name: '密码' }).fill('password123')
    await page.getByRole('button', { name: '登录' }).click()

    await page.waitForURL(/\/admin$/, { timeout: 15_000 })
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('管理端首页')
  })

  test('清除登录态后访问受保护页会跳转登录', async ({ page }) => {
    await login(page)

    await page.evaluate(() => {
      localStorage.removeItem('user')
    })

    await page.goto('/admin')
    await expect(page).toHaveURL(/\/login(\?redirect=.*)?$/)
  })

  test('登录后可访问门户首页', async ({ page }) => {
    await login(page)

    await page.goto('/portal')
    await expect(page.getByText('门户端首页')).toBeVisible()
  })
})
