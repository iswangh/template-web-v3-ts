<script setup lang="ts">
import type { FormRules } from 'element-plus'
import type { FormSlots, ProcessedSlot } from './types'
import type { FormItem } from '@/components/SchemaFormItem'
import { SchemaFormItem } from '@/components/SchemaFormItem'
import { useForm } from '@/composables/form'

interface DemoFormData {
  [key: string]: unknown
}

const DEFAULT_FORM_DATA: DemoFormData = {
  name: '',
}

const { form: formData, formRef, loading, isDirty, validate, reset } = useForm<DemoFormData>(DEFAULT_FORM_DATA)

const formItems = ref<FormItem[]>([
  {
    prop: 'input',
    label: '输入框（配置化插槽）',
    compType: 'input',
    slots: {
      label: () => h('span', { style: 'color: var(--el-color-warning); font-weight: 600;' }, '配置化标签'),
    },
    compProps: {
      slots: {
        prefix: () => h('span', { style: 'color: var(--el-color-primary);' }, '@'),
      },
    },
  },
])

const rules: FormRules = {}

function buildSlotsFromConfig(items: FormItem[]): FormSlots {
  const formItemSlots = new Map<string, ProcessedSlot[]>()
  const dynamicCompSlots = new Map<string, ProcessedSlot[]>()

  for (const item of items) {
    if (item.slots) {
      const mappedFormSlots = Object.entries(item.slots)
        .filter(([, slotFn]) => typeof slotFn === 'function')
        .map(([slotName, slotFn]) => ({
          rawSlotName: `form-item-${item.prop}-${slotName}`,
          slotName,
          slotFn,
        }))
      if (mappedFormSlots.length > 0)
        formItemSlots.set(item.prop, mappedFormSlots)
    }

    const compSlots = (item.compProps as { slots?: Record<string, (...args: unknown[]) => unknown> } | undefined)?.slots
    if (compSlots) {
      const mappedCompSlots = Object.entries(compSlots)
        .filter(([, slotFn]) => typeof slotFn === 'function')
        .map(([slotName, slotFn]) => ({
          rawSlotName: `${item.prop}-${slotName}`,
          slotName,
          slotFn,
        }))
      if (mappedCompSlots.length > 0)
        dynamicCompSlots.set(item.prop, mappedCompSlots)
    }
  }

  return { formItemSlots, dynamicCompSlots }
}

const formSlots = computed(() => buildSlotsFromConfig(formItems.value))

async function onSubmit() {
  await validate()
  ElMessage.success('配置化插槽测试提交成功')
  // eslint-disable-next-line no-console
  console.log('config-slots-submit', { ...formData.value })
}

function onReset() {
  reset()
}
</script>

<template>
  <ElForm
    ref="formRef"
    :form-data="formData"
    :model="formData"
    :rules="rules"
    label-width="96px"
    style="max-width: 820px"
    @submit.prevent
  >
    <SchemaFormItem
      v-for="(item, index) in formItems"
      :key="item.prop"
      v-model="formData[item.prop]"
      :form-item="item"
      :index="index"
      :form-data="formData"
      :form-slots="formSlots"
      :dynamic-comp-events="{}"
    />
    <ElFormItem>
      <ElButton type="primary" :loading="loading" @click="onSubmit">
        提交
      </ElButton>
      <ElButton :disabled="!isDirty" @click="onReset">
        重置
      </ElButton>
    </ElFormItem>
  </ElForm>
  <pre class="preview">{{ JSON.stringify(formData, null, 2) }}</pre>
</template>

<style lang="scss" scoped>
.preview {
  margin-top: 16px;
  padding: 12px;
  font-size: 12px;
  line-height: 1.5;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  overflow: auto;
}
</style>
