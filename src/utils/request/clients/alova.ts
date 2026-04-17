import type { InternalAxiosRequestConfig } from 'axios'
import { axiosRequestAdapter } from '@alova/adapter-axios'
import { createAlova } from 'alova'
import vueHook from 'alova/vue'
import { REQUEST_CONFIG } from '../config'
import { errorHandler, requestInterceptor, responseInterceptor } from '../interceptors'

/**
 * Alova 实例
 *
 * 用于发送 HTTP 请求的 Alova 实例，已配置基础 URL、超时时间和请求适配器
 *
 * @see {@link https://alova.js.org/ Alova 官方文档}
 */
export const alovaClient = createAlova({
  ...REQUEST_CONFIG,
  id: 'main-alova-instance',
  statesHook: vueHook,
  requestAdapter: axiosRequestAdapter(),
  beforeRequest: (method) => {
    const { headers, paramsSerializer } = requestInterceptor({
      headers: method.config.headers || {},
      method: method.type,
      params: method.config.params,
      data: method.data,
    } as InternalAxiosRequestConfig)

    method.config.headers = headers
    method.config.paramsSerializer = paramsSerializer
  },
  responded: { onSuccess: responseInterceptor, onError: errorHandler },
})
