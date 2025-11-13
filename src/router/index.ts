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
router.beforeEach((to, from, next) => {
  // 错误页面直接放行，无需权限验证
  if (['NotFound', 'ServerError', 'Forbidden'].includes(to.name as string))
    return next()

  // 需要登录但未登录时，重定向到登录页并记录原目标路径
  if (to.meta.requiresAuth && !useUserStore().isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  }
  else {
    next()
  }
})

export type * from './types'

export default router
