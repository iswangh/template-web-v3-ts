/**
 * @file Mock 数据配置文件
 *
 * 使用 vite-plugin-mock 和 mockjs 生成模拟数据，用于开发和测试阶段。
 * 定义了各种 API 接口的模拟响应数据。
 *
 * @see {@link https://github.com/vbenjs/vite-plugin-mock vite-plugin-mock 文档}
 * @see {@link http://mockjs.com/ MockJS 文档}
 */

import type { MockMethod } from 'vite-plugin-mock'
import Mock from 'mockjs'

export default [
  {
    url: '/api/test/base',
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
