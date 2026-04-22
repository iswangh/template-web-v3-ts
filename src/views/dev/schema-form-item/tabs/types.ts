import type { FormItem } from '@/components/SchemaFormItem'

export interface ProcessedSlot {
  rawSlotName: string
  slotName: string
  slotFn: (...args: unknown[]) => unknown
}

export interface FormSlots {
  formItemSlots: Map<string, ProcessedSlot[]>
  dynamicCompSlots: Map<string, ProcessedSlot[]>
}

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
  formSlots?: FormSlots
  dynamicCompEvents?: Record<string, (...args: unknown[]) => unknown>
}
