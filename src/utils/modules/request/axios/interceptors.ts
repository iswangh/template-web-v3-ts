import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { BaseResponse } from '../types'
import { PARAMS_SERIALIZE_OPTIONS, TOKEN } from '@/configs'
import { paramsSerializer } from '../util'

export const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  // * token
  config.headers.Auth = `${TOKEN}`

  // * get 请求处理数组参数序列化
  if (config.method?.toLowerCase() === 'get' && config.params) {
    config.paramsSerializer = params => paramsSerializer(params, PARAMS_SERIALIZE_OPTIONS)
  }

  // * FormData 参数处理 Content-Type
  if (config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data'
  }

  return config
}

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
