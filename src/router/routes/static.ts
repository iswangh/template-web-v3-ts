import type { RouteRecordRaw } from 'vue-router'
import { HOME_REDIRECT } from '@/config'

/**
 * 静态路由
 *
 * 应用的基础路由配置，包含首页等核心路由
 */
export const staticRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    redirect: HOME_REDIRECT ?? '/admin',
    meta: {
      title: '首页',
      requiresAuth: true,
      app: 'shared',
      hidden: false,
    },
    children: [
      // 管理首页（默认）
      {
        path: '/admin',
        name: 'HomeAdmin',
        component: () => import('@/views/home/admin/index.vue'),
        meta: {
          title: '首页',
          requiresAuth: true,
          app: 'admin',
        },
      },
      // 门户首页
      {
        path: 'portal',
        name: 'HomePortal',
        component: () => import('@/views/home/portal/index.vue'),
        meta: {
          title: '首页',
          requiresAuth: true,
          app: 'portal',
        },
      },
    ],
  },
]
