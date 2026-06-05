# HTTP 请求层

项目在 `src/utils/request/` 封装统一的请求配置与拦截器，对外暴露三种客户端。

## 目录结构

```
src/utils/request/
├── config.ts              # BASE_URL、TIMEOUT（来自 @/config）
├── interceptors.ts        # 请求/响应/错误拦截（Axios 与 Alova 共用）
├── clients/
│   ├── axios.ts           # axiosClient
│   ├── alova.ts           # alovaClient
│   └── tanstack-query.ts  # queryClient
├── utils.ts               # 参数序列化、cleanUndefined 等
├── types.d.ts             # BaseResponse 等类型
└── index.ts               # 统一导出
```

## 基础配置

| 配置项 | 来源 | 默认值 |
|--------|------|--------|
| `baseURL` | `VITE_API_BASE_URL` | 见各 `.env.*` |
| `timeout` | `config/api.ts` → `TIMEOUT` | `10000` ms |
| GET 数组参数 | `PARAMS_SERIALIZE_OPTIONS` | `format: 'repeat'` |

## Axios

```typescript
import { axiosClient } from '@/utils'

// 典型 API 封装（src/api/test.ts）
export const baseTestAPI = (params) =>
  axiosClient({ url: '/biz/dict/data/list', params })
```

拦截器行为：

- **请求**：注入 `Auth` 头、过滤 `undefined`、GET 参数序列化
- **响应**：`code !== 200` 时 reject；`code === 401` 预留登出逻辑
- **错误**：统一 `console.error` 并 reject

## Alova

```typescript
import { alovaClient } from '@/utils'

const method = alovaClient.Get('/api/users')
const { loading, data } = useRequest(method)
```

Alova 通过 `@alova/adapter-axios` 复用 Axios 适配器，并在 `beforeRequest` / `responded` 中调用同一套拦截器逻辑。

## TanStack Vue Query

`queryClient` 在 `main.ts` 中通过 `VueQueryPlugin` 注册。

默认 query 配置：

| 选项 | 值 |
|------|-----|
| `staleTime` | 5 分钟 |
| `gcTime` | 10 分钟 |
| `retry` | 3 |
| `refetchOnWindowFocus` | `true` |

```typescript
import { useQuery } from '@tanstack/vue-query'
import { axiosClient } from '@/utils'

const { data, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: () => axiosClient.get('/api/users').then(res => res.data),
})
```

可在单次 `useQuery` 或 `queryClient.setQueryDefaults` 中覆盖默认值。

## 响应类型

业务响应约定（`types.d.ts`）：

```typescript
interface BaseResponse<T = unknown> {
  code: number
  data: T
  message: string
}
```

`responseInterceptor` 在 `code === 200` 时返回完整 `response.data`（含 code/message/data）。

## 认证 Token

当前模板在 `config/api.ts` 中配置了测试用 `TOKEN`，拦截器将其写入请求头 `Auth`。

生产环境应：

1. 从登录接口获取 token，经 `useUserStore().setToken()` 写入
2. 在 `requestInterceptor` 中改为读取 store 或 cookie（`getAuthToken()`）
3. 移除硬编码 `TOKEN` 常量

用户 store 已启用 `pinia-plugin-persistedstate`，token 会持久化到 localStorage。

## 扩展建议

- 401 处理：在 `responseInterceptor` 中调用 `useUserStore().logout()` 并跳转登录
- 统一错误提示：在 `errorHandler` 中接入 Element Plus `ElMessage`
- 新 API：在 `src/api/` 下按模块封装，利用 auto-import 免手动 import
