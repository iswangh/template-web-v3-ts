/**
 * useForm 组合式函数单元测试
 *
 * 覆盖默认值、set/reset、脏检查与 submit 流程；不依赖真实 el-form，formRef.validate 用 mock。
 */

import type { FormInstance } from 'element-plus'
import { describe, expect, it, vi } from 'vitest'
import { useForm } from './useForm'

interface SampleForm {
  username: string
  password: string
}

describe('useForm', () => {
  it('initializes with default values', () => {
    const { form, isDirty } = useForm<SampleForm>({ username: 'admin', password: '' })

    expect(form.value).toEqual({ username: 'admin', password: '' })
    // 未修改时应与初始快照一致
    expect(isDirty.value).toBe(false)
  })

  it('set merges data and marks form dirty', () => {
    const { form, set, isDirty } = useForm<SampleForm>({ username: '', password: '' })

    set({ username: 'tester' })

    expect(form.value.username).toBe('tester')
    expect(isDirty.value).toBe(true)
  })

  it('reset restores default values', () => {
    const { form, set, reset } = useForm<SampleForm>({ username: 'admin', password: '' })

    set({ username: 'changed' })
    reset()

    expect(form.value.username).toBe('admin')
  })

  it('reset(true) clears form data', () => {
    const { form, set, reset } = useForm<SampleForm>({ username: 'admin', password: '' })

    set({ username: 'changed' })
    // clear 模式：表单数据置为空对象，而非恢复 defaultData
    reset(true)

    expect(form.value).toEqual({})
  })

  it('submit validates then calls handler with current form data', async () => {
    const { formRef, submit } = useForm<SampleForm>({ username: 'admin', password: 'secret' })

    // 模拟 Element Plus 校验通过，避免挂载真实 el-form
    const validate = vi.fn().mockResolvedValue(undefined)
    formRef.value = { validate } as unknown as FormInstance

    const handler = vi.fn()
    await submit(handler)

    expect(validate).toHaveBeenCalledOnce()
    expect(handler).toHaveBeenCalledWith({ username: 'admin', password: 'secret' })
  })
})
