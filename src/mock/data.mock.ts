// mock/data.mock.ts
import type { MockMethod } from 'vite-plugin-mock'
import Mock from 'mockjs'

export default [
  {
    url: '/api/mock-data',
    method: 'get',
    response: () => {
      return {
        code: 200,
        data: Mock.mock({
          'list|10': [{
            'id|+1': 1,
            'name': '@cname',
            'age|18-60': 1,
            'email': '@email',
            'address': '@city(true)',
            'date': '@date',
          }],
        }),
        message: '获取模拟数据成功',
      }
    },
  },
] as MockMethod[]
