/**
 * @file 应用入口文件
 *
 * 应用程序的主入口文件，负责初始化 Vue 应用、注册插件、配置路由和状态管理等核心功能。
 * 集成了 Pinia、Vue Router、Vue Query、vue-i18n、Element Plus 等核心依赖，提供完整的应用基础架构。
 */

import { VueQueryPlugin } from '@tanstack/vue-query'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createAppI18n } from '@/i18n'
import { queryClient } from '@/utils'
import App from './App.vue'
import { setupElementPlus } from './plugins'
import router from './router'
import pinia from './stores'
import 'virtual:uno.css'

pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

setupElementPlus(app)

app.use(router).use(pinia).use(createAppI18n()).use(VueQueryPlugin, { queryClient })

app.mount('#app')
