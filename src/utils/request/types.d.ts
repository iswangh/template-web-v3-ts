import type { ExtendableObject } from '@/types'

/**
 * 基础响应结构
 *
 * @template T - 响应数据的类型，默认为 unknown
 */
export interface BaseResponse<T = unknown> extends ExtendableObject {
  /** 响应状态码 */
  code: number
  /** 响应消息 */
  message: string
  /** 响应数据 */
  data: T
}

/**
 * 分页数据格式
 *
 * @template T - 数据项的类型，默认为 unknown
 */
export interface PaginatedData<T = unknown> extends ExtendableObject {
  /** 数据列表 */
  rows: T[]
  /** 数据总数 */
  total: number
}

/**
 * 分页响应结构
 *
 * @template T - 数据项的类型，默认为 unknown
 */
export type PaginatedResponse<T = unknown> = BaseResponse<PaginatedData<T>>

/**
 * 分页查询参数
 */
export interface PaginationParams extends ExtendableObject {
  /** 页码，默认为 1 */
  pageNo?: number
  /** 页大小，默认为 10 */
  pageSize?: number
}

/**
 * 参数序列化选项
 */
export interface ParamsSerializerOptions {
  /** 数组参数格式化策略：repeat（重复键名）、index（索引格式）、join（连接格式） */
  format?: 'repeat' | 'index' | 'join'
  /** 数组索引起始值，仅在 format 为 'index' 时生效，默认为 0 */
  startIndex?: number
  /** 数组元素分隔符，仅在 format 为 'join' 时生效，默认为 ',' */
  separator?: string
}
