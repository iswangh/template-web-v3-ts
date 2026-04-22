<script setup lang="ts">
import type { FormRules } from 'element-plus'
import type { FormItem } from '@/components/SchemaFormItem'
import { SchemaFormItem } from '@/components/SchemaFormItem'
import { useForm } from '@/composables/form'

interface DemoFormData {
  [key: string]: unknown
}

const DEFAULT_FORM_DATA: DemoFormData = {
  name: '',
  dept: '',
  actions: '',
}

const { form: formData, formRef, loading, isDirty, validate, reset } = useForm<DemoFormData>(DEFAULT_FORM_DATA)

const formItems: FormItem[] = [
  { prop: 'name', label: '姓名', compType: 'input' },
  { prop: 'dept', label: '部门', compType: 'select' },
  {
    prop: 'actions',
    label: '',
    compType: 'custom',
    class: 'actions-row',
  },
]

const rules: FormRules = {}

async function onSubmit() {
  await validate()
  ElMessage.success('插槽测试提交成功')
  // eslint-disable-next-line no-console
  console.log('slots-submit', { ...formData.value })
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
      :dynamic-comp-events="{}"
    >
      <template #label>
        {{ item.compType === 'custom' ? '操作(插槽)' : item.label }}
      </template>

      <template v-if="item.prop === 'actions'">
        <ElButton type="primary" :loading="loading" @click="onSubmit">
          提交
        </ElButton>
        <ElButton :disabled="!isDirty" @click="onReset">
          重置
        </ElButton>
      </template>
    </SchemaFormItem>
  </ElForm>
  <pre class="mt-4 overflow-auto rounded-1 bg-[var(--el-fill-color-light)] p-3 text-3 leading-6">{{ JSON.stringify(formData, null, 2) }}</pre>
</template>
