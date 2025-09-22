import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { BaseResponse } from '../types'
import { TOKEN } from '@/configs'

export const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  // * token
  config.headers.Authorization = `Bearer ${TOKEN}`

  // * get 请求处理数组参数

  // * FormData 参数处理 Content-Type
  if (config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data'
  }

  console.log('请求拦截:', config)
  return config
}

export const responseInterceptor = (response: AxiosResponse) => {
  console.log('响应拦截:', response)
  const { data }: { data: BaseResponse } = response
  const { code, msg } = data ?? {}

  if (code === 401) {
    // * 退出登录
  }

  if (code !== 200) {
    console.error('请求失败：', msg)
    return Promise.reject(msg)
  }

  return response
}

export const errorHandler = (error: AxiosError) => {
  console.error('错误拦截:', error.message)
  return Promise.reject(error.message)
}
