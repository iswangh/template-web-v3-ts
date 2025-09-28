import type { BaseResponse } from '../types'
import { axiosRequestAdapter } from '@alova/adapter-axios'
import { createAlova } from 'alova'
import vueHook from 'alova/vue'
import { BASE_URL, PARAMS_SERIALIZE_OPTIONS, TIMEOUT, TOKEN } from '@/configs'
import { paramsSerializer } from '@/utils/modules/request/util'

/** Alova 实例 */
export const alovaClient = createAlova({
  id: 'main-alova-instance',
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  statesHook: vueHook,
  requestAdapter: axiosRequestAdapter(),

  beforeRequest: (method) => {
    // * token
    method.config.headers = {
      ...method.config.headers,
      Auth: `${TOKEN}`,
    }

    // * GET 请求处理数组参数序列化
    if (method.type.toLowerCase() === 'get' && method.config.params) {
      method.config.paramsSerializer = params => paramsSerializer(params, PARAMS_SERIALIZE_OPTIONS)
    }

    // * FormData 参数处理 Content-Type
    if (method.data instanceof FormData) {
      method.config.headers['Content-Type'] = 'multipart/form-data'
    }
  },
  responded: {
    onSuccess: (response) => {
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
    },
    onError: (error) => {
      console.error('错误拦截:', error.message)
      return Promise.reject(error.message)
    },
  },
})
