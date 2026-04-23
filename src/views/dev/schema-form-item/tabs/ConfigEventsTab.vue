<script setup lang="ts">
import type { FormRules } from 'element-plus'
import type { FormItem } from '@/components/SchemaFormItem'

interface DemoFormData {
  [key: string]: unknown
}

const DEFAULT_FORM_DATA: DemoFormData = {
  input: '',
  switch: false,
  actions: '',
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

function pushEventLog(field: string, eventName: string, args: unknown[] = []) {
  const paramsText = args.length > 0
    ? args.map((arg, index) => `arg${index}: ${formatParam(arg)}`).join(', ')
    : '无参数'

  eventLogs.value.unshift(
    `${new Date().toLocaleTimeString()} - ${field} ${eventName}(${paramsText})`,
  )
  if (eventLogs.value.length > 20)
    eventLogs.value = eventLogs.value.slice(0, 20)
  // eslint-disable-next-line no-console
  console.log('[config-events-tab]', { field, eventName, args })
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

const formItems = ref<FormItem[]>([
  {
    prop: 'input',
    label: '输入框（配置化事件）',
    compType: 'input',
    compProps: {
      onFocus: (...args: unknown[]) => pushEventLog('input', 'onFocus', args),
      onBlur: (...args: unknown[]) => pushEventLog('input', 'onBlur', args),
      onInput: (...args: unknown[]) => pushEventLog('input', 'onInput', args),
    },
  },
  {
    prop: 'switch',
    label: '开关（配置化事件）',
    compType: 'switch',
    compProps: {
      onChange: (...args: unknown[]) => pushEventLog('switch', 'onChange', args),
    },
  },
  {
    prop: 'actions',
    label: '',
    compType: 'custom',
    class: 'actions-row',
    slots: {
      default: () => {
        const Btn = resolveComponent('ElButton')
        return h('div', { class: 'flex flex-wrap gap-2' }, [
          h(Btn, { type: 'primary', loading: loading.value, onClick: onSubmit }, () => '提交'),
          h(Btn, { disabled: !isDirty.value, onClick: onReset }, () => '重置'),
        ])
      },
    },
  },
])
</script>

<template>
  <ElForm
    ref="formRef"
    class="mx-auto w-full max-w-[820px]"
    :model="formData"
    :rules="rules"
    label-width="96px"
    @submit.prevent
  >
    <SchemaFormItem
      v-for="item in formItems"
      :key="item.prop"
      v-model="formData[item.prop]"
      :form-item="item"
    />
  </ElForm>
  <ElAlert
    title="事件日志"
    type="info"
    :closable="false"
    class="mx-auto mt-3 w-full max-w-[820px]"
    role="status"
    aria-live="polite"
    aria-atomic="true"
  />
  <pre
    class="mx-auto mt-3 max-h-[11.25rem] w-full max-w-[820px] overflow-auto rounded-lg border border-[var(--el-border-color-lighter)] bg-[var(--el-fill-color-lighter)] p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words tabular-nums"
  >{{ eventLogs.join('\n') || '暂无事件日志' }}</pre>
  <pre
    class="mx-auto mt-4 max-h-[min(40vh,280px)] w-full max-w-[820px] overflow-auto rounded-lg border border-[var(--el-border-color-lighter)] bg-[var(--el-fill-color-light)] p-3 font-mono text-xs leading-relaxed tabular-nums"
  >{{ JSON.stringify(formData, null, 2) }}</pre>
</template>
