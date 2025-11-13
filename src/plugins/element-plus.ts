import type { App } from 'vue'
import * as ElementPlusIcons from '@element-plus/icons-vue'

/**
 * 注册 Element Plus 图标组件
 *
 * @param {App} app - Vue 应用实例
 */
function setupElementPlusIcons(app: App) {
  for (const [key, component] of Object.entries(ElementPlusIcons)) {
    app.component(key, component)
  }
}

/**
 * 完整的 Element Plus 插件配置
 *
 * @param {App} app - Vue 应用实例
 */
export function setupElementPlus(app: App) {
  setupElementPlusIcons(app)
}
