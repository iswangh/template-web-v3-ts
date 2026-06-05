/**
 * SchemaFormItem 开发联调页 E2E 测试
 *
 * 白名单路由 /dev/schema-form-item，无需登录；验证各 Tab 联调用例。
 */

import { expect, test } from '@playwright/test'

test.describe('SchemaFormItem 开发页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dev/schema-form-item')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('SchemaFormItem 联调')
  })

  test('开发页可访问并展示标题', async ({ page }) => {
    await expect(page.getByRole('tab', { name: '基础' })).toBeVisible()
  })

  test('基础 Tab 展示表单字段', async ({ page }) => {
    await page.getByRole('tab', { name: '基础' }).click()
    await expect(page.getByText('姓名', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '提交' })).toBeVisible()
  })

  test('显隐 Tab 可切换 condition 与 visible', async ({ page }) => {
    await page.getByRole('tab', { name: '显隐' }).click()

    await expect(page.getByText('挂载字段 A', { exact: true })).toBeVisible()
    await expect(page.getByText('字段 A', { exact: true })).toBeVisible()
    await expect(page.getByText('字段 B', { exact: true })).toBeVisible()

    await page.locator('.el-form-item').filter({ hasText: '挂载字段 A' }).locator('.el-switch__core').click()
    await expect(page.getByText('字段 A', { exact: true })).not.toBeVisible()

    await page.locator('.el-form-item').filter({ hasText: '显示字段 B' }).locator('.el-switch__core').click()
    await expect(page.getByText('字段 B', { exact: true })).not.toBeVisible()
  })

  test('useLoadOptions Tab 可加载异步选项', async ({ page }) => {
    await page.getByRole('tab', { name: 'useLoadOptions' }).click()

    await expect(page.getByText('部门', { exact: true })).toBeVisible()
    const reloadButton = page.getByRole('button', { name: '重新加载下拉选项' })
    await expect(reloadButton).toBeVisible()

    await reloadButton.click()
    await expect(reloadButton).toHaveClass(/is-loading/)
    await expect(reloadButton).not.toHaveClass(/is-loading/, { timeout: 5000 })

    const deptSelect = page.locator('.el-form-item').filter({ hasText: '部门' }).locator('.el-select__wrapper')
    await deptSelect.click()
    await expect(page.getByRole('option', { name: '北京（异步）' })).toBeVisible({ timeout: 5000 })
  })

  test('事件优先级 Tab 模板事件覆盖配置事件', async ({ page }) => {
    await page.getByRole('tab', { name: '事件优先级' }).click()

    const focusInput = page.locator('.el-form-item').filter({ hasText: '焦点' }).getByRole('textbox')
    await focusInput.focus()

    const logPanel = page.locator('pre').filter({ hasText: /template\.onFocus|compProps\.onFocus/ })
    await expect(logPanel).toContainText('template.onFocus', { timeout: 5_000 })
    await expect(logPanel).not.toContainText('compProps.onFocus')
  })

  test('插槽优先级 Tab 模板插槽覆盖配置插槽', async ({ page }) => {
    await page.getByRole('tab', { name: '插槽优先级' }).click()

    await expect(page.getByText('输入框（模板生效）')).toBeVisible()
    await expect(page.getByText('配置化 label（应被模板覆盖）')).not.toBeVisible()
  })
})
