import type { RouteRecordRaw } from 'vue-router'

/**
 * 白名单路由
 *
 * 这些路由不需要登录认证，任何用户都可以访问
 */
export const whitelistRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/login/index.vue'),
    meta: {
      title: '登录',
      requiresAuth: false,
      app: 'shared',
      hidden: true,
      module: 'auth',
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/register/index.vue'),
    meta: {
      title: '注册',
      requiresAuth: false,
      app: 'shared',
      hidden: true,
    },
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '页面不存在',
      requiresAuth: false,
      app: 'shared',
      hidden: true,
    },
  },
  {
    path: '/500',
    name: 'ServerError',
    component: () => import('@/views/error/500.vue'),
    meta: {
      title: '服务器错误',
      requiresAuth: false,
      app: 'shared',
      hidden: true,
    },
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: {
      title: '无权限访问',
      requiresAuth: false,
      app: 'shared',
      hidden: true,
    },
  },
]
