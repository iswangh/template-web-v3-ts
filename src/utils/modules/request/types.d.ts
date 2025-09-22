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
  headers?: Record<string, string>
  /** 查询参数（GET 请求使用） */
  params?: Record<string, unknown>
}

/**
 * 分页查询参数
 */
export interface PaginationParams extends ExtendableObject {
  pageNo?: number
  pageSize?: number
}
