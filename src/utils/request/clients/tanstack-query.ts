import { QueryClient } from '@tanstack/vue-query'

/**
 * TanStack Query 实例
 *
 * 用于管理应用中的服务器状态，提供数据获取、缓存、同步和更新功能
 *
 * 默认配置说明：
 * - staleTime: 300000ms (5分钟内数据视为新鲜，不会重新获取)
 * - gcTime: 600000ms (缓存10分钟后被垃圾回收)
 * - retry: 3 (请求失败时重试3次)
 * - refetchOnWindowFocus: true (窗口聚焦时自动重新获取数据)
 *
 * 这些默认配置可以在使用 useQuery 时通过传递选项进行覆盖
 *
 * @example
 * // 基本用法
 * import { queryClient } from '@/utils/request/tanstack'
 *
 * // 覆盖默认配置
 * const { data } = useQuery({
 *   queryKey: ['users'],
 *   queryFn: fetchUsers,
 *   staleTime: 60000, // 覆盖为1分钟
 *   retry: 1 // 覆盖为重试1次
 * })
 *
 * // 设置特定查询键的默认配置
 * queryClient.setQueryDefaults(['users'], {
 *   staleTime: 300000 // 5分钟
 * })
 *
 * @see {@link https://tanstack.com/query/latest/docs/vue/overview TanStack Query 官方文档}
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分钟内视为新鲜数据
      gcTime: 1000 * 60 * 10, // 缓存10分钟
      retry: 3, // 失败重试3次
      refetchOnWindowFocus: true, // 窗口聚焦时重新获取
    },
  },
})
