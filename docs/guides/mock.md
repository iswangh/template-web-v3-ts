# Mock 数据

开发环境可通过 [vite-plugin-mock](https://github.com/vbenjs/vite-plugin-mock) 拦截 HTTP 请求，返回模拟数据。

## 启用条件

同时满足：

1. 运行 `nr dev`（`command === 'serve'`）
2. `.env.development` 中 `VITE_USE_MOCK = true`

修改后需重启 dev server。测试/预发布/生产构建不会启用 Mock。

## 配置文件

Mock 定义位于 `src/mock/`，默认文件 `data.mock.ts`：

```typescript
import type { MockMethod } from 'vite-plugin-mock'
import Mock from 'mockjs'

export default [
  {
    url: '/api/test/base',
    method: 'get',
    response: () => ({
      code: 200,
      data: Mock.mock({ 'list|10': [{ 'id|+1': 1, name: '@cname' }] }),
      message: '获取模拟数据成功',
    }),
  },
] as MockMethod[]
```

## Vite 插件配置

见 `vite.config.ts`：

```typescript
viteMockServe({
  mockPath: 'src/mock',
  enable: isServe && useMock,
  logger: true,
  watchFiles: true,
})
```

- `mockPath` — Mock 文件目录
- `logger` — 控制台输出匹配日志
- `watchFiles` — 热更新 Mock 定义

## 编写 Mock 接口

1. 在 `src/mock/` 新增或扩展 `*.mock.ts` 文件
2. `url` 支持路径匹配（无需写完整域名）
3. 使用 [MockJS](http://mockjs.com/) 语法生成随机数据
4. 响应格式建议与真实 API 一致（`code` / `data` / `message`），便于复用拦截器逻辑

## 与真实 API 切换

| 场景 | 操作 |
|------|------|
| 本地纯 Mock | `VITE_USE_MOCK=true`，`VITE_API_BASE_URL` 可留占位 |
| 联调后端 | `VITE_USE_MOCK=false`，配置正确的 `VITE_API_BASE_URL` |
| 部分 Mock | 关闭全局 Mock，改用 axios mock adapter 或 MSW |

## 注意事项

- Mock 仅作用于开发服务器，**不会**打包进生产产物
- Mock 路径需与前端请求 URL 一致（注意 `baseURL` 拼接方式）
- 复杂场景可拆分多个 mock 文件，插件会扫描 `mockPath` 下所有匹配文件
