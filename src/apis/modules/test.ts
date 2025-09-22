import { axiosInstance } from '@/utils'

export const baseTestAPI = () => axiosInstance({ url: '/record/thirdPart' })
