/* eslint-disable ts/no-explicit-any */
import type { FormInstance } from 'element-plus'

type SubmitHandler<T> = (formData: T) => Promise<void> | void

/**
 * 表单组合式函数
 *
 * 提供完整的表单管理功能，包括数据管理、验证、提交等。
 * 支持类型安全的表单数据管理，自动处理表单状态和错误。
 *
 * @template T 表单数据类型，必须是对象类型
 * @param {Partial<T> | (() => Partial<T>)} [defaultData] - 默认表单数据
 * @returns {object} 表单管理对象
 *
 * @example
 * ```typescript
 * interface LoginForm {
 *   username: string
 *   password: string
 * }
 *
 * const { form, formRef, loading, submit, reset } = useForm<LoginForm>({ username: 'admin' })
 * ```
 */
export function useForm<T extends Record<string, any>>(
  defaultData?: Partial<T> | (() => Partial<T>),
) {
  const defaultValues = _cloneDeep(
    typeof defaultData === 'function'
      ? defaultData()
      : (defaultData ?? {}),
  ) as Partial<T>

  const form = ref(_cloneDeep(defaultValues) as T)

  const formRef = ref<FormInstance>()

  const loading = ref(false)

  const isDirty = computed(() => {
    return !_isEqual(form.value, defaultValues)
  })

  /**
   * 设置表单数据
   *
   * 合并策略：
   * - 新设置的字段值（最高优先级）
   * - 当前已修改的字段值（中优先级）
   * - 默认字段值（最低优先级）
   *
   * @param {Partial<T>} data - 要设置的表单数据
   */
  const set = (data: Partial<T>) => {
    form.value = { ..._cloneDeep(defaultValues), ...form.value, ...data } as T
  }

  /**
   * 重置表单
   *
   * 支持两种模式：
   * - 完全清空：将表单数据清空为空对象
   * - 恢复默认：将表单数据恢复到初始默认值
   *
   * @param {boolean} [clear] - 是否完全清空（true: 清空为 {}; false: 恢复到初始值）
   */
  const reset = (clear = false) => {
    formRef.value?.resetFields()
    if (clear) {
      form.value = {} as T
    }
    else {
      form.value = _cloneDeep(defaultValues) as T
    }
  }

  /**
   * 验证整个表单
   *
   * @returns {Promise<boolean>} 验证是否通过
   */
  const validate = async (): Promise<boolean> => {
    if (!formRef.value)
      return Promise.reject(new Error('Form instance is not available'))

    try {
      await formRef.value.validate()
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 提交表单
   *
   * 自动处理表单验证和加载状态，验证通过后执行提交处理函数。
   *
   * @param {SubmitHandler<T>} handler - 提交处理函数
   * @returns {Promise<void>}
   */
  const submit = async (handler: SubmitHandler<T>): Promise<void> => {
    // 验证表单
    const isValid = await validate()
    if (!isValid)
      return

    // 设置加载状态
    loading.value = true

    try {
      // 执行提交处理函数
      await handler(form.value)
    }
    finally {
      // 清除加载状态
      loading.value = false
    }
  }

  return { form, formRef, loading: readonly(loading), isDirty, set, reset, validate, submit }
}
