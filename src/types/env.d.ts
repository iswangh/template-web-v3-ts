/// <reference types="vite/client" />

interface ImportMetaEnv {
  // 应用环境配置
  readonly VITE_APP_ENV: 'development' | 'production' | 'staging'

  // API 配置
  readonly VITE_API_BASE_URL: string

  // 构建配置
  readonly VITE_BUILD_DROP_CONSOLE: string
  readonly VITE_BUILD_DROP_DEBUGGER: string
  readonly VITE_BUILD_SOURCEMAP: string

  // 功能开关
  readonly VITE_USE_MOCK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
