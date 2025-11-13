import type { ExtendableObject } from '@/types'
import { axiosClient } from '@/utils'

/**
 * 测试 API 接口
 *
 * @param {ExtendableObject} params - 请求参数
 * @returns {Promise} 请求响应
 */
export const baseTestAPI = (params: ExtendableObject) => axiosClient({ url: '/biz/dict/data/list', params })
