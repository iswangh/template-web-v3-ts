# 路由与鉴权

路由基于 **Vue Router 5**，采用静态路由 + 白名单路由拆分，入口见 `src/router/`。

## 路由组织

```
src/router/
├── index.ts           # createRouter、beforeEach 守卫
├── types.d.ts         # RouteMeta 扩展、AppType
└── routes/
    ├── index.ts       # allRoutes = static + whitelist
    ├── static.ts      # 需登录的核心页面（首页等）
    └── whitelist.ts   # 无需登录的公开页面
```

## RouteMeta 字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | string | 页面标题（面包屑、菜单） |
| `requiresAuth` | boolean | 是否需要登录 |
| `app` | `'shared'` \| `'admin'` \| `'portal'` | 应用域 |
| `hidden` | boolean? | 是否在菜单中隐藏 |
| `module` | string? | 业务模块（菜单分组） |
| `icon` | string? | 菜单图标名 |

## 鉴权守卫

`router/index.ts` 中的 `beforeEach`：

1. 错误页（404 / 403 / 500）直接放行
2. `meta.requiresAuth === true` 且未登录 → 重定向 `/login?redirect=原路径`

登录状态由 `useUserStore().isLoggedIn` 判断（基于 token 是否存在）。

## 内置路由一览

### 静态路由（`static.ts`）

| 路径 | name | 说明 |
|------|------|------|
| `/` | Home | 重定向至 `HOME_REDIRECT`（默认 `/admin`） |
| `/admin` | HomeAdmin | 管理端首页 |
| `/portal` | HomePortal | 门户首页 |

### 白名单路由（`whitelist.ts`）

| 路径 | name | 说明 |
|------|------|------|
| `/login` | Login | 登录 |
| `/register` | Register | 注册 |
| `/forgot-password` | ForgotPassword | 忘记密码 |
| `/403` | Forbidden | 无权限 |
| `/404` | NotFound | 页面不存在 |
| `/500` | ServerError | 服务器错误 |
| `/dev/schema-form-item` | DevSchemaFormItem | SchemaFormItem 开发调试页 |

## 首页重定向

`src/config/app.ts`：

```typescript
export const HOME_REDIRECT = '/admin'
```

修改此常量即可变更登录后的默认落地页。

## 用户状态

`src/stores/user.ts` 提供：

- `token` / `userInfo` — 响应式状态
- `isLoggedIn` — 计算属性
- `login()` / `logout()` — 登录登出
- `persist: true` — 刷新后保持登录态

登出时会清除 cookie 中的 `token`（见 `utils/cookies.ts`）。

## 扩展路由

1. **需登录页面** → 添加到 `static.ts`（或后续拆出的动态路由模块），设置 `requiresAuth: true`
2. **公开页面** → 添加到 `whitelist.ts`，设置 `requiresAuth: false`
3. 404 兜底：当前未配置 `/:pathMatch(.*)*`，可按需补充

## 多应用（admin / portal）

`meta.app` 用于区分管理端与门户端路由，便于后续菜单/权限过滤。共享功能使用 `app: 'shared'`。
