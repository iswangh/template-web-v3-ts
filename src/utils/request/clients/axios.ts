import axios from 'axios'
import { REQUEST_CONFIG } from '../config'
import { errorHandler, requestInterceptor, responseInterceptor } from '../interceptors'

/**
 * Axios 实例
 *
 * 用于发送 HTTP 请求的 Axios 实例，已配置基础 URL、超时时间和默认请求头
 *
 * @see {@link https://axios-http.com/docs/intro Axios 官方文档}
 * @see {@link https://www.axios-http.cn/ Axios 中文文档}
 */
export const axiosClient = axios.create(REQUEST_CONFIG)

// 请求拦截器
axiosClient.interceptors.request.use(requestInterceptor, errorHandler)

// 响应拦截器
axiosClient.interceptors.response.use(responseInterceptor, errorHandler)
