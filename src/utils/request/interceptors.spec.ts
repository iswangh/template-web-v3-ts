/**
 * request/interceptors 单元测试
 */

import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { describe, expect, it, vi } from 'vitest'
import { PARAMS_SERIALIZE_OPTIONS, TOKEN } from '@/config'
import { errorHandler, requestInterceptor, responseInterceptor } from './interceptors'
import { paramsSerializer } from './utils'

describe('requestInterceptor', () => {
  it('sets auth header, cleans params/data, and adds paramsSerializer for GET', () => {
    const config = {
      method: 'get',
      headers: {},
      params: { q: 'test', skip: undefined },
      data: { body: undefined, keep: 1 },
    } as InternalAxiosRequestConfig

    const result = requestInterceptor(config)

    expect(result.headers.Auth).toBe(TOKEN)
    expect(result.params).toEqual({ q: 'test' })
    expect(result.data).toEqual({ keep: 1 })
    expect(result.paramsSerializer).toBeTypeOf('function')
    expect(result.paramsSerializer?.({ tags: ['a', 'b'] })).toBe(
      paramsSerializer({ tags: ['a', 'b'] }, PARAMS_SERIALIZE_OPTIONS),
    )
  })

  it('does not attach paramsSerializer for non-GET requests', () => {
    const config = {
      method: 'post',
      headers: {},
      params: { q: 'test' },
    } as InternalAxiosRequestConfig

    const result = requestInterceptor(config)

    expect(result.paramsSerializer).toBeUndefined()
  })
})

describe('responseInterceptor', () => {
  it('returns data when code is 200', () => {
    const response = {
      data: { code: 200, message: 'ok', data: { id: 1 } },
    } as AxiosResponse

    expect(responseInterceptor(response)).toEqual(response.data)
  })

  it('rejects with message when code is not 200', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const response = {
      data: { code: 500, message: '服务器错误' },
    } as AxiosResponse

    await expect(responseInterceptor(response)).rejects.toBe('服务器错误')
    expect(consoleError).toHaveBeenCalled()
    consoleError.mockRestore()
  })
})

describe('errorHandler', () => {
  it('logs and rejects with error message', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = { message: 'Network Error' } as AxiosError

    await expect(errorHandler(error)).rejects.toBe('Network Error')
    expect(consoleError).toHaveBeenCalledWith('错误拦截:', 'Network Error')
    consoleError.mockRestore()
  })
})
