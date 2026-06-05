/**
 * SchemaFormItem 开发联调页 E2E 测试
 *
 * 白名单路由 /dev/schema-form-item，无需登录；仅冒烟验证页面可达与标题渲染。
 */

import { expect, test } from '@playwright/test'

test.describe('SchemaFormItem 开发页', () => {
  test('开发页可访问并展示标题', async ({ page }) => {
    await page.goto('/dev/schema-form-item')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('SchemaFormItem 联调')
  })
})
