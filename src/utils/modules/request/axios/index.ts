import axios from 'axios'
import { BASE_URL, TIMEOUT } from '@/configs'
import { errorHandler, requestInterceptor, responseInterceptor } from './interceptors'

/**
 * Axios 实例
 */
export const axiosClient = axios.create({ baseURL: BASE_URL, timeout: TIMEOUT, headers: { 'Content-Type': 'application/json' } })

// 请求拦截器
axiosClient.interceptors.request.use(requestInterceptor, errorHandler)

// 响应拦截器
axiosClient.interceptors.response.use(responseInterceptor, errorHandler)
