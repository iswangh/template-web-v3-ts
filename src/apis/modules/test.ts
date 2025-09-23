import type { ExtendableObject } from '@/types'
import { axiosInstance } from '@/utils'

export const baseTestAPI = (params: ExtendableObject) => axiosInstance({ url: '/biz/dict/data/list', params })
