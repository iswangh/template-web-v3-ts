<script setup lang="ts">
import type { FormRules } from 'element-plus'
import type { FormItems } from '@/components/SchemaFormItem'

interface DemoFormData {
  [key: string]: unknown
}

const formItems: FormItems = [
  { prop: 'name', label: '姓名', compType: 'input' },
  { prop: 'age', label: '年龄', compType: 'input-number', compProps: { min: 0, max: 120 } },
  { prop: 'enableNotice', label: '启用通知', compType: 'switch' },
  { prop: 'workload', label: '工作负载', compType: 'slider', compProps: { min: 0, max: 100 } },
  { prop: 'performanceRate', label: '绩效评分', compType: 'rate' },
  { prop: 'actions', label: '', compType: 'custom', class: 'actions-row' },
]

const DEFAULT_FORM_DATA: DemoFormData = {
  name: '',
  age: 18,
  enableNotice: true,
  workload: 40,
  performanceRate: 3,
}

const { form: formData, formRef, loading, isDirty, validate, reset } = useForm<DemoFormData>(DEFAULT_FORM_DATA)

const rules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
}

async function onSubmit() {
  await validate()

  ElMessage.success('基础测试提交成功')
  // eslint-disable-next-line no-console
  console.log('basic-submit', { ...formData.value })
}
</script>

<template>
  <ElForm
    ref="formRef"
    class="mx-auto w-full max-w-[820px]"
    :model="formData"
    :rules="rules"
    label-width="96px"
    scroll-to-error
    :scroll-into-view-options="{ behavior: 'smooth', block: 'center', inline: 'nearest' }"
    @submit.prevent
  >
    <SchemaFormItem
      v-for="item in formItems"
      :key="item.prop"
      v-model="formData[item.prop]"
      :form-item="item"
      :form-data="formData"
    >
      <template v-if="item.prop === 'actions'">
        <div class="flex flex-wrap gap-2">
          <ElButton type="primary" :loading="loading" @click="onSubmit">
            提交
          </ElButton>
          <ElButton :disabled="!isDirty" @click="() => reset()">
            重置
          </ElButton>
        </div>
      </template>
    </SchemaFormItem>
  </ElForm>
  <pre
    class="mx-auto mt-4 max-h-[min(40vh,280px)] w-full max-w-[820px] overflow-auto rounded-lg border border-[var(--el-border-color-lighter)] bg-[var(--el-fill-color-light)] p-3 font-mono text-xs leading-relaxed tabular-nums"
  >{{ JSON.stringify(formData, null, 2) }}</pre>
</template>
