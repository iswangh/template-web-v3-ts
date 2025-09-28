import type { ExtendableObject } from '@/types'
import { axiosClient } from '@/utils'

export const baseTestAPI = (params: ExtendableObject) => axiosClient({ url: '/biz/dict/data/list', params })
