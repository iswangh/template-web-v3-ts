import { staticRoutes } from './static'
import { whitelistRoutes } from './whitelist'

/** 所有路由（包含静态路由和白名单路由） */
export const allRoutes = [...staticRoutes, ...whitelistRoutes]
