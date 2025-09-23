import type { SerializeOptions } from '@/utils'

/** API 接口基础请求地址 */
export const BASE_URL = import.meta.env.VITE_API_BASE_URL

/** API 请求超时时间 */
export const TIMEOUT = 10000

/** 请求参数序列化配置 */
export const SERIALIZE_OPTIONS: SerializeOptions = {
  format: 'repeat',
}

export const TOKEN = '0bd43e74-c5c0-4649-8939-9e91ad05cb91'
