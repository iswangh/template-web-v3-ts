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
}

const { form: formData, formRef, loading, isDirty, validate, reset } = useForm<DemoFormData>(DEFAULT_FORM_DATA)
const eventLogs = ref<string[]>([])

const formItems: FormItem[] = [
  { prop: 'name', label: '姓名', compType: 'input' },
  { prop: 'age', label: '年龄', compType: 'input-number', compProps: { min: 0, max: 120 } },
  { prop: 'enableNotice', label: '启用通知', compType: 'switch' },
]

const rules: FormRules = {}

function pushEventLog(message: string) {
  eventLogs.value.unshift(`${new Date().toLocaleTimeString()} - ${message}`)
  if (eventLogs.value.length > 20)
    eventLogs.value = eventLogs.value.slice(0, 20)
  // eslint-disable-next-line no-console
  console.log('[events-tab]', message)
}

function onSchemaItemChange(extended: { prop: string }, value: unknown) {
  pushEventLog(`统一事件: ${extended.prop} onChange -> ${String(value ?? '')}`)
}

async function onSubmit() {
  await validate()
  ElMessage.success('事件测试提交成功')
  // eslint-disable-next-line no-console
  console.log('events-submit', { ...formData.value })
}

function onReset() {
  reset()
  eventLogs.value = []
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
      @change="onSchemaItemChange"
      @focus="console.log('focus', $event)"
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
  <ElAlert
    title="事件日志"
    type="info"
    :closable="false"
    class="log-alert"
  />
  <pre class="event-log">{{ eventLogs.join('\n') || '暂无事件日志' }}</pre>
  <pre class="preview">{{ JSON.stringify(formData, null, 2) }}</pre>
</template>

<style lang="scss" scoped>
.log-alert {
  margin-top: 12px;
}

.event-log {
  margin-top: 8px;
  padding: 12px;
  font-size: 12px;
  line-height: 1.5;
  max-height: 180px;
  overflow: auto;
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}

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
