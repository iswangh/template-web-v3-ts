import type { FormItem } from '@/components/SchemaFormItem'

export interface TabCommonProps {
  formData: Record<string, unknown>
  formRef?: unknown
  rules: Record<string, unknown>
  loading: boolean
  isDirty: boolean
  onSubmit: () => void
  onReset: () => void
}

export interface TabSchemaProps extends TabCommonProps {
  formItems: FormItem[]
}
