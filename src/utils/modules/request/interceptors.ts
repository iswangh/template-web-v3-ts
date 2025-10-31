import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { BaseResponse } from './types'
import { PARAMS_SERIALIZE_OPTIONS, TOKEN } from '@/configs'
import { cleanUndefined, paramsSerializer } from './utils'

/**
 * 请求拦截器
 *
 * 在请求发送前统一处理 token、参数序列化、undefined 值过滤等
 *
 * @param {InternalAxiosRequestConfig} config - Axios 请求配置对象
 * @returns {InternalAxiosRequestConfig} 处理后的请求配置
 */
export const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  // * token
  config.headers.Auth = `${TOKEN}`

  // * 过滤 undefined
  config.params = cleanUndefined(config.params)
  config.data = cleanUndefined(config.data)

  // * get 请求处理数组参数序列化
  if (config.method?.toLowerCase() === 'get' && config.params) {
    config.paramsSerializer = params => paramsSerializer(params, PARAMS_SERIALIZE_OPTIONS)
  }

  return config
}

/**
 * 响应拦截器
 *
 * 统一处理响应数据，包括业务错误码处理和成功响应数据提取
 *
 * @param {AxiosResponse<BaseResponse>} response - Axios 响应对象
 * @returns {BaseResponse} 业务响应数据
 */
export const responseInterceptor = (response: AxiosResponse) => {
  const { data }: { data: BaseResponse } = response
  const { code, message } = data ?? {}

  if (code === 401) {
    // * 退出登录
  }

  if (code !== 200) {
    console.error('请求失败：', message)
    return Promise.reject(message)
  }

  return response.data
}

export const errorHandler = (error: AxiosError) => {
  console.error('错误拦截:', error.message)
  return Promise.reject(error.message)
}
