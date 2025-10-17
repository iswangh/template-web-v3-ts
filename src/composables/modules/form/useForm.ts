import type { FormInstance } from 'element-plus'

export const useForm = <T extends object>(defaultData?: Partial<T> | (() => Partial<T>)) => {
  /**
   * 表单默认值（深拷贝避免引用问题）
   */
  const defaultValues = _cloneDeep(_isFunction(defaultData) ? defaultData() : defaultData ?? {})

  /**
   * 表单数据(响应式)
   */
  const form = ref(_cloneDeep(defaultValues) as unknown as T)

  /**
   * 表单实例
   *
   */
  const formRef = ref<FormInstance>()

  /**
   * 设置表单数据
   *
   * 合并策略：
   * - 新设置的字段值（最高优先级）
   * - 当前已修改的字段值（中优先级）
   * - 默认字段值（最低优先级）
   */
  const setForm = (data: Partial<T>) => {
    form.value = { ..._cloneDeep(defaultValues), ...form.value, ...data }
  }

  /**
   * 重置表单（支持两种模式）
   * @param {boolean} [clear] - 是否完全清空（true: 清空为 {}; false: 恢复到初始值）
   */
  const resetForm = (clear = false) => {
    formRef.value?.resetFields()
    clear && (form.value = {})
  }

  /**
   * 表单验证方法
   *
   * @param {boolean} [scrollToError] - 是否滚动到第一个错误字段
   */
  const validateForm = async (scrollToError = true) => {
    if (!formRef.value)
      return Promise.reject(new Error('Form instance is not available'))

    try {
    // 直接使用 Element Plus 的 validate 方法
      await formRef.value.validate()
    }
    catch (error) {
    // 如果需要滚动到错误字段且存在错误字段
      if (scrollToError && error) {
      // 获取第一个错误字段名称
        const firstErrorField = Object.keys(error)[0]

        // 滚动到第一个错误字段
        firstErrorField && formRef.value.scrollToField(firstErrorField)
      }

      // 重新抛出错误
      throw error
    }
  }

  return { form, formRef, setForm, resetForm, validateForm }
}
