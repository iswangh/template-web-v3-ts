/**
 * 路由守卫单元测试
 *
 * 使用轻量路由复现 index.ts 中的守卫逻辑，避免懒加载视图引入 Element Plus CSS。
 */

import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

function createGuardedRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/login',
        name: 'Login',
        component: { template: '<div>login</div>' },
        meta: { title: '登录', requiresAuth: false, app: 'shared' },
      },
      {
        path: '/register',
        name: 'Register',
        component: { template: '<div>register</div>' },
        meta: { title: '注册', requiresAuth: false, app: 'shared' },
      },
      {
        path: '/dev/schema-form-item',
        name: 'DevSchemaFormItem',
        component: { template: '<div>dev</div>' },
        meta: { title: 'SchemaFormItem 测试', requiresAuth: false, app: 'shared' },
      },
      {
        path: '/admin',
        name: 'HomeAdmin',
        component: { template: '<div>admin</div>' },
        meta: { title: '管理端首页', requiresAuth: true, app: 'admin' },
      },
      {
        path: '/404',
        name: 'NotFound',
        component: { template: '<div>404</div>' },
        meta: { title: '页面不存在', requiresAuth: false, app: 'shared' },
      },
      {
        path: '/500',
        name: 'ServerError',
        component: { template: '<div>500</div>' },
        meta: { title: '服务器错误', requiresAuth: false, app: 'shared' },
      },
      {
        path: '/403',
        name: 'Forbidden',
        component: { template: '<div>403</div>' },
        meta: { title: '无权限访问', requiresAuth: false, app: 'shared' },
      },
    ],
  })

  router.beforeEach((to) => {
    if (['NotFound', 'ServerError', 'Forbidden'].includes(to.name as string))
      return

    if (to.meta.requiresAuth && !useUserStore().isLoggedIn) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }
  })

  return router
}

describe('router beforeEach guard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('redirects unauthenticated users to login with redirect query', async () => {
    const router = createGuardedRouter()
    await router.push('/admin')

    expect(router.currentRoute.value.path).toBe('/login')
    expect(router.currentRoute.value.query.redirect).toBe('/admin')
  })

  it('allows authenticated users to access protected routes', async () => {
    const router = createGuardedRouter()
    const store = useUserStore()
    store.setToken('logged-in-token')

    await router.push('/admin')

    expect(router.currentRoute.value.path).toBe('/admin')
  })

  it('skips auth check for NotFound, ServerError, and Forbidden routes', async () => {
    const router = createGuardedRouter()

    await router.push('/404')
    expect(router.currentRoute.value.name).toBe('NotFound')

    await router.push('/500')
    expect(router.currentRoute.value.name).toBe('ServerError')

    await router.push('/403')
    expect(router.currentRoute.value.name).toBe('Forbidden')
  })

  it('allows whitelist routes without authentication', async () => {
    const router = createGuardedRouter()

    await router.push('/register')
    expect(router.currentRoute.value.name).toBe('Register')

    await router.push('/dev/schema-form-item')
    expect(router.currentRoute.value.name).toBe('DevSchemaFormItem')
  })
})
