import { BASE_URL, TIMEOUT } from '@/configs'

/**
 * HTTP 请求基础配置
 *
 * 定义了所有 HTTP 请求客户端（Axios、Alova 等）的通用配置
 *
 * @property {string} baseURL - API 基础请求地址
 * @property {number} timeout - 请求超时时间（毫秒）
 */
export const REQUEST_CONFIG = { baseURL: BASE_URL, timeout: TIMEOUT } as const
