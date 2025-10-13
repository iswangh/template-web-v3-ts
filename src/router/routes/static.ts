import type { RouteRecordRaw } from 'vue-router'
import { HOME_REDIRECT } from '@/configs'

/**
 * 静态路由（无需登录即可访问）
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
          hidden: false,
          icon: 'ep:monitor',
          keepAlive: true,
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
          hidden: true,
          icon: 'ep:data-analysis',
          keepAlive: true,
        },
      },
    ],
  },
]
