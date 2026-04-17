/**
 * @file 路由配置入口文件
 *
 * 创建并配置 Vue Router 实例，包括路由定义、路由守卫等核心功能。
 * 实现了基于路由元信息的权限控制和登录状态检查。
 */

import { createRouter, createWebHistory } from 'vue-router'
import { allRoutes } from './routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: allRoutes,
})

// 路由守卫：处理权限验证和登录状态检查
router.beforeEach((to) => {
  if (['NotFound', 'ServerError', 'Forbidden'].includes(to.name as string))
    return

  if (to.meta.requiresAuth && !useUserStore().isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
})

export type * from './types'

export default router
