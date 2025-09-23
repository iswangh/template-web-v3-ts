import type { ExtendableObject } from '@/types'

/**
 * 基础响应结构
 */
export interface BaseResponse<T = unknown> extends ExtendableObject {
  code: number
  message: string
  data: T
}

/**
 * 分页数据格式
 */
export interface PaginatedData<T = unknown> extends ExtendableObject {
  rows: T[]
  total: number
}

/**
 * 分页响应结构
 */
export type PaginatedResponse<T = unknown> = BaseResponse<PaginatedData<T>>

/**
 * 请求配置选项
 * 用于 alova 请求方法的配置
 */
export interface RequestOptions extends ExtendableObject {
  /** 是否立即发起请求（useRequest 钩子使用） */
  immediate?: boolean
  /** 初始化数据（useRequest 钩子使用） */
  initialData?: unknown
  /** 请求超时时间（毫秒），优先级高于全局配置 */
  timeout?: number
  /** 自定义请求头 */
  headers?: ExtendableObject<string>
  /** 查询参数（GET 请求使用） */
  params?: ExtendableObject
}

/**
 * 分页查询参数
 */
export interface PaginationParams extends ExtendableObject {
  pageNo?: number
  pageSize?: number
}

/**
 * 参数序列化选项
 * @interface SerializeOptions
 * @description 用于配置参数序列化行为的选项接口
 * @property {('repeat' | 'index' | 'join')} [format] - 数组参数格式化策略
 *   - repeat: 重复键名格式，如 `tags=vue&tags=react`
 *   - index: 索引格式，如 `tags[0]=vue&tags[1]=react`
 *   - join: 连接格式，如 `tags=vue,react` (分隔符可配置)
 * @property {number} [startIndex] - 数组索引起始值，仅在 format 为 'index' 时生效，默认为 0
 * @property {string} [separator] - 数组元素分隔符，仅在 format 为 'join' 时生效，默认为 ','
 */
export interface SerializeOptions {
  format?: 'repeat' | 'index' | 'join'
  startIndex?: number
  separator?: string
}
