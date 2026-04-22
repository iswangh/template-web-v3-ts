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
  age: 18,
  enableNotice: true,
  workload: 40,
  performanceRate: 3,
}

const { form: formData, formRef, loading, isDirty, validate, reset } = useForm<DemoFormData>(DEFAULT_FORM_DATA)

const formItems: FormItem[] = [
  { prop: 'name', label: '姓名', compType: 'input' },
  { prop: 'age', label: '年龄', compType: 'input-number', compProps: { min: 0, max: 120 } },
  { prop: 'enableNotice', label: '启用通知', compType: 'switch' },
  { prop: 'workload', label: '工作负载', compType: 'slider', compProps: { min: 0, max: 100 } },
  { prop: 'performanceRate', label: '绩效评分', compType: 'rate' },
]

const rules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
}

async function onSubmit() {
  await validate()

  ElMessage.success('基础测试提交成功')
  // eslint-disable-next-line no-console
  console.log('basic-submit', { ...formData.value })
}

function onReset() {
  reset()
}
</script>

<template>
  <ElForm
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-width="96px"
    style="max-width: 820px"
    scroll-to-error
    :scroll-into-view-options="{ behavior: 'smooth', block: 'center', inline: 'nearest' }"
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
