import 'vue-router'

export { }

/**
 * 应用类型定义
 *
 * - `admin`: 管理端应用 - 管理系统后台功能
 * - `portal`: 门户应用 - 面向用户的数据展示
 * - `shared`: 共享应用 - 两个应用都能访问的功能
 */
export type AppType = 'shared' | 'admin' | 'portal'

/**
 * 扩展 vue-router 的路由元信息类型
 * 用于定义路由的额外元数据，如标题、权限要求等
 * @see https://router.vuejs.org/guide/advanced/meta.html
 */
declare module 'vue-router' {
  /**
   * 路由元信息接口扩展
   * 包含路由的标题、权限要求、显示控制等附加信息
   */
  interface RouteMeta {
    /**
     * 路由标题
     *
     * 用于面包屑、菜单显示等场景
     *
     * @example "个人中心"
     */
    title: string

    /**
     * 是否需要登录认证
     *
     * 为 true 时，未登录用户将被重定向到登录页
     *
     * @example true
     */
    requiresAuth: boolean

    /**
     * 应用类型定义
     */
    app: AppType

    /**
     * 是否在菜单中隐藏该路由
     *
     * 为 true 时，不会在侧边栏等菜单组件中显示
     *
     * @default false
     * @example true
     */
    hidden?: boolean

    /**
     * 路由所属业务模块
     *
     * 用于菜单分组或权限过滤
     *
     * @example "system"
     */
    module?: string

    /**
     * 菜单图标
     *
     * 通常对应图标库的图标名称（如 Font Awesome、Element Plus Icon）
     *
     * @example "User"
     */
    icon?: string
  }
}
