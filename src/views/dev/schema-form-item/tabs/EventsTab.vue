<script setup lang="ts">
import type { FormRules } from 'element-plus'
import type { FormItem } from '@/components/SchemaFormItem'

interface DemoFormData {
  [key: string]: unknown
}

const DEFAULT_FORM_DATA: DemoFormData = {
  name: '',
  age: 18,
  enableNotice: true,
  actions: '',
}

const { form: formData, formRef, loading, isDirty, validate, reset } = useForm<DemoFormData>(DEFAULT_FORM_DATA)
const eventLogs = ref<string[]>([])

const rules: FormRules = {}

function pushEventLog(message: string) {
  eventLogs.value.unshift(`${new Date().toLocaleTimeString()} - ${message}`)
  if (eventLogs.value.length > 20)
    eventLogs.value = eventLogs.value.slice(0, 20)
  // eslint-disable-next-line no-console
  console.log('[events-tab]', message)
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

const formItems: FormItem[] = [
  { prop: 'name', label: '姓名', compType: 'input' },
  { prop: 'age', label: '年龄', compType: 'input-number', compProps: { min: 0, max: 120 } },
  { prop: 'enableNotice', label: '启用通知', compType: 'switch' },
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
]
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
    <template v-for="item in formItems" :key="item.prop">
      <SchemaFormItem
        v-if="item.prop !== 'actions'"
        v-model="formData[item.prop]"
        :form-item="item"
        @change="(v: unknown) => pushEventLog(`${item.prop} onChange -> ${String(v ?? '')}`)"
        @focus="console.log('focus', $event)"
      />
      <SchemaFormItem
        v-else
        v-model="formData[item.prop]"
        :form-item="item"
      />
    </template>
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
