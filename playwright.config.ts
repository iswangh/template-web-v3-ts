/**
 * @file Playwright E2E 测试配置文件
 *
 * 基于 Playwright 的端到端测试配置，支持多浏览器测试、重试与自动启动开发/预览服务。
 * 本地使用 dev 服务（端口取自 .env.development）；CI 使用 build + preview 模拟生产环境。
 *
 * @see {@link https://playwright.dev/ Playwright 官方网站}
 * @see {@link https://playwright.dev/docs/test-configuration Playwright 配置文档}
 */

import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'
import { loadEnv } from 'vite'

/** 是否在 CI 环境运行（通过环境变量 CI 判断） */
const isCI = !!process.env.CI

/** 读取 development 模式下的 Vite 环境变量（含 VITE_SERVER_PORT） */
const env = loadEnv('development', process.cwd(), '')

/** 解析本地 dev 端口；无效或未配置时回退到 Vite 默认 5173 */
function resolveDevPort(): number {
  const port = Number.parseInt(env.VITE_SERVER_PORT, 10)
  return Number.isNaN(port) || port < 1 || port > 65535 ? 5173 : port
}

const devPort = resolveDevPort()
/** vite preview 默认端口，CI 构建后预览使用 */
const previewPort = 4173
/** 测试访问的基础 URL：本地 dev / CI preview 各用对应端口 */
const baseURL = isCI ? `http://localhost:${previewPort}` : `http://localhost:${devPort}`

export default defineConfig({
  /** E2E 用例目录 */
  testDir: './e2e',
  /** 单个用例最长执行时间（毫秒） */
  timeout: 30 * 1000,
  expect: {
    /** expect 断言等待条件成立的最长时间（如 toHaveText、toHaveURL） */
    timeout: 5000,
  },
  /** CI 下若残留 test.only 则直接失败，避免误提交只跑部分用例 */
  forbidOnly: isCI,
  /** 失败重试：CI 2 次、本地 1 次，缓解 dev 服务预热或浏览器偶发竞态 */
  retries: isCI ? 2 : 1,
  /** 单 worker 串行，避免多进程共用一个 dev 服务时的导航/登录态冲突 */
  workers: 1,
  /** 测试报告格式；html 可在 playwright-report 中查看 */
  reporter: 'html',
  /** 所有 browser 项目共用的默认选项 */
  use: {
    /** 单次操作（click、fill 等）超时；0 表示不单独限制，由用例级 timeout 兜底 */
    actionTimeout: 0,
    /** page.goto('/') 等相对路径的前缀 */
    baseURL,

    /** 仅在重试失败用例时收集 trace，便于 Playwright Trace Viewer 排查 */
    trace: 'on-first-retry',

    /** CI 无界面运行；本地默认有头，方便观察页面行为 */
    headless: isCI,
  },

  /** 在 Chromium / Firefox / WebKit 三套引擎上各跑一遍相同用例 */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },
  ],

  /** 跑测前自动启动 Web 服务；就绪后 Playwright 再开始执行用例 */
  webServer: {
    /** CI：先构建再以 preview 提供静态资源；本地：pnpm dev */
    command: isCI
      ? 'pnpm run build-only && pnpm exec vite preview --port 4173 --strictPort'
      : 'pnpm run dev',
    /** 轮询该 URL，返回 200 即视为服务就绪 */
    url: baseURL,
    /** 本地若已有 dev 在跑则复用，不重复起进程 */
    reuseExistingServer: !isCI,
    /** 等待服务启动的最长时间；CI 含 build 故更长 */
    timeout: isCI ? 120_000 : 60_000,
  },
})
