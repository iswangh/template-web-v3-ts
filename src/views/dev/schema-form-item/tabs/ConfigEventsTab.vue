<script setup lang="ts">
import type { FormRules } from 'element-plus'
import type { FormItems } from '@/components/SchemaFormItem'

interface DemoFormData {
  [key: string]: unknown
}

const DEFAULT_FORM_DATA: DemoFormData = {
  input: '',
  switch: false,
}

const { form: formData, formRef, loading, isDirty, validate, reset } = useForm<DemoFormData>(DEFAULT_FORM_DATA)
const eventLogs = ref<string[]>([])

const rules: FormRules = {}

function formatParam(param: unknown): string {
  if (param instanceof Event)
    return `${param.constructor.name}(type=${param.type})`
  if (typeof param === 'string')
    return `"${param}"`
  if (typeof param === 'number' || typeof param === 'boolean' || param == null)
    return String(param)
  try {
    return JSON.stringify(param)
  }
  catch {
    return Object.prototype.toString.call(param)
  }
}

function pushEventLog(field: string, eventName: string, payload: unknown = '') {
  const payloadText = formatParam(payload)
  eventLogs.value.unshift(`${new Date().toLocaleTimeString()} - ${field} ${eventName} -> ${payloadText}`)
  if (eventLogs.value.length > 20)
    eventLogs.value = eventLogs.value.slice(0, 20)
  // eslint-disable-next-line no-console
  console.log('[config-events-tab]', { field, eventName, payload })
}

async function onSubmit() {
  await validate()
  ElMessage.success('配置化事件测试提交成功')
  // eslint-disable-next-line no-console
  console.log('config-events-submit', { ...formData.value })
}

function onReset() {
  reset()
  eventLogs.value = []
}

const formItems: FormItems = [
  {
    prop: 'input',
    label: '输入框',
    compType: 'input',
    compProps: {
      onFocus: (...args: unknown[]) => pushEventLog('input', 'onFocus', args[0] ?? ''),
      onBlur: (...args: unknown[]) => pushEventLog('input', 'onBlur', args[0] ?? ''),
      onChange: (...args: unknown[]) => pushEventLog('input', 'onChange', args[0] ?? ''),
      onInput: (...args: unknown[]) => pushEventLog('input', 'onInput', args[0] ?? ''),
      onClear: (...args: unknown[]) => pushEventLog('input', 'onClear', args[0] ?? ''),
      onKeydown: (...args: unknown[]) => pushEventLog('input', 'onKeydown', args[0] ?? ''),
      onMouseenter: (...args: unknown[]) => pushEventLog('input', 'onMouseenter', args[0] ?? ''),
      onMouseleave: (...args: unknown[]) => pushEventLog('input', 'onMouseleave', args[0] ?? ''),
      onCompositionstart: (...args: unknown[]) => pushEventLog('input', 'onCompositionstart', args[0] ?? ''),
      onCompositionupdate: (...args: unknown[]) => pushEventLog('input', 'onCompositionupdate', args[0] ?? ''),
      onCompositionend: (...args: unknown[]) => pushEventLog('input', 'onCompositionend', args[0] ?? ''),
    },
  },
  {
    prop: 'switch',
    label: '开关',
    compType: 'switch',
    compProps: {
      onChange: (...args: unknown[]) => pushEventLog('switch', 'onChange', args[0] ?? ''),
    },
  },
  {
    prop: 'actions',
    label: '',
    compType: 'custom',
    class: 'actions-row',
  },
]
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
          <ElButton :disabled="!isDirty" @click="onReset">
            重置
          </ElButton>
        </div>
      </template>
    </SchemaFormItem>
  </ElForm>
  <pre
    class="mx-auto mt-3 max-h-[11.25rem] w-full max-w-[820px] overflow-auto rounded-lg border border-[var(--el-border-color-lighter)] bg-[var(--el-fill-color-lighter)] p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words tabular-nums"
  >{{ eventLogs.join('\n') || '暂无事件日志' }}</pre>
  <pre
    class="mx-auto mt-4 max-h-[min(40vh,280px)] w-full max-w-[820px] overflow-auto rounded-lg border border-[var(--el-border-color-lighter)] bg-[var(--el-fill-color-light)] p-3 font-mono text-xs leading-relaxed tabular-nums"
  >{{ JSON.stringify(formData, null, 2) }}</pre>
</template>
