import type { ExtendableObject } from '@/types'

/**
 * 基础响应结构
 *
 * 定义了API响应的基本结构，包含状态码、消息和数据
 *
 * @template T - 响应数据的类型，默认为 unknown
 * @property {number} code - 响应状态码
 * @property {string} message - 响应消息
 * @property {T} data - 响应数据
 */
export interface BaseResponse<T = unknown> extends ExtendableObject {
  code: number
  message: string
  data: T
}

/**
 * 分页数据格式
 *
 * 分页数据格式，包含数据列表和数据总数
 *
 * @template T - 数据项的类型，默认为 unknown
 * @property {T[]} rows - 数据列表
 * @property {number} total - 数据总数
 */
export interface PaginatedData<T = unknown> extends ExtendableObject {
  rows: T[]
  total: number
}

/**
 * 分页响应结构
 *
 * 定义了分页响应的结构，是基础响应结构与分页数据结构的组合
 *
 * @template T - 数据项的类型，默认为 unknown
 */
export type PaginatedResponse<T = unknown> = BaseResponse<PaginatedData<T>>

/**
 * 分页查询参数
 *
 * 定义了分页查询参数的结构
 *
 * @property {number} [pageNo] - 页码，默认为 1
 * @property {number} [pageSize] - 页大小，默认为 10
 */
export interface PaginationParams extends ExtendableObject {
  pageNo?: number
  pageSize?: number
}

/**
 * 参数序列化选项
 *
 * 用于配置参数序列化行为的选项接口
 *
 * @property {('repeat' | 'index' | 'join')} [format] - 数组参数格式化策略
 *   - repeat: 重复键名格式，如 `tags=vue&tags=react`
 *   - index: 索引格式，如 `tags[0]=vue&tags[1]=react`
 *   - join: 连接格式，如 `tags=vue,react` (分隔符可配置)
 * @property {number} [startIndex] - 数组索引起始值，仅在 format 为 'index' 时生效，默认为 0
 * @property {string} [separator] - 数组元素分隔符，仅在 format 为 'join' 时生效，默认为 ','
 */
export interface ParamsSerializerOptions {
  format?: 'repeat' | 'index' | 'join'
  startIndex?: number
  separator?: string
}
