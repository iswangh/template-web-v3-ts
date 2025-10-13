import { staticRoutes } from './static'
import { whitelistRoutes } from './whitelist'

/**
 * 所有路由
 *
 * 包含 静态路由、白名单路由
 */
export const allRoutes = [...staticRoutes, ...whitelistRoutes]
