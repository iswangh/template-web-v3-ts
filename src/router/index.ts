import { createRouter, createWebHistory } from 'vue-router'
import { allRoutes } from './routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: allRoutes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 错误页面直接放行
  if (['NotFound', 'ServerError', 'Forbidden'].includes(to.name as string))
    return next()

  // 未登录需重定向到登录页，登录后继续访问原目标页
  to.meta.requiresAuth && !useUserStore().isLoggedIn ? next({ path: '/login', query: { redirect: to.fullPath } }) : next()
})

export type * from './types'

export default router
