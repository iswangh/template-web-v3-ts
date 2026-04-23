<script setup lang="ts">
import type { FormRules } from 'element-plus'
import type { FormItem } from '@/components/SchemaFormItem'

interface DemoFormData {
  [key: string]: unknown
}

const DEFAULT_FORM_DATA: DemoFormData = { x: '' }

const { form: formData, formRef, loading, isDirty, validate, reset } = useForm<DemoFormData>(DEFAULT_FORM_DATA)
const eventLogs = ref<string[]>([])

const rules: FormRules = {}

function pushEventLog(message: string) {
  eventLogs.value.unshift(`${new Date().toLocaleTimeString()} - ${message}`)
  if (eventLogs.value.length > 20)
    eventLogs.value = eventLogs.value.slice(0, 20)
  // eslint-disable-next-line no-console
  console.log('[event-priority-tab]', message)
}

function logFieldEvent(field: string, eventName: string, payload?: unknown) {
  const suffix = payload === undefined
    ? ''
    : payload instanceof Event
      ? ` -> ${payload.constructor.name}(type=${payload.type})`
      : ` -> ${String(payload)}`
  pushEventLog(`${field} ${eventName}${suffix}`)
}

async function onSubmit() {
  await validate()
  ElMessage.success('事件优先级示例提交')
}

function onReset() {
  reset()
  eventLogs.value = []
}

const formItems: FormItem[] = [
  {
    prop: 'x',
    label: '焦点',
    compType: 'input',
    compProps: {
      onFocus: (...args: unknown[]) => logFieldEvent('x', 'compProps.onFocus', args[0] ?? ''),
      onBlur: (...args: unknown[]) => logFieldEvent('x', 'compProps.onBlur', args[0] ?? ''),
      onChange: (...args: unknown[]) => logFieldEvent('x', 'compProps.onChange', args[0] ?? ''),
      onInput: (...args: unknown[]) => logFieldEvent('x', 'compProps.onInput', args[0] ?? ''),
      onClear: (...args: unknown[]) => logFieldEvent('x', 'compProps.onClear', args[0] ?? ''),
      onKeydown: (...args: unknown[]) => logFieldEvent('x', 'compProps.onKeydown', args[0] ?? ''),
      onMouseenter: (...args: unknown[]) => logFieldEvent('x', 'compProps.onMouseenter', args[0] ?? ''),
      onMouseleave: (...args: unknown[]) => logFieldEvent('x', 'compProps.onMouseleave', args[0] ?? ''),
      onCompositionstart: (...args: unknown[]) => logFieldEvent('x', 'compProps.onCompositionstart', args[0] ?? ''),
      onCompositionupdate: (...args: unknown[]) => logFieldEvent('x', 'compProps.onCompositionupdate', args[0] ?? ''),
      onCompositionend: (...args: unknown[]) => logFieldEvent('x', 'compProps.onCompositionend', args[0] ?? ''),
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
    label-width="120px"
    scroll-to-error
    :scroll-into-view-options="{ behavior: 'smooth', block: 'center', inline: 'nearest' }"
    @submit.prevent
  >
    <template v-for="item in formItems" :key="item.prop">
      <SchemaFormItem
        v-if="item.prop === 'x'"
        v-model="formData[item.prop]"
        :form-item="item"
        :form-data="formData"
        @focus="logFieldEvent(item.prop, 'template.onFocus', $event)"
        @blur="logFieldEvent(item.prop, 'template.onBlur', $event)"
        @change="logFieldEvent(item.prop, 'template.onChange', $event)"
        @input="logFieldEvent(item.prop, 'template.onInput', $event)"
        @clear="logFieldEvent(item.prop, 'template.onClear', $event)"
        @keydown="logFieldEvent(item.prop, 'template.onKeydown', $event)"
        @mouseenter="logFieldEvent(item.prop, 'template.onMouseenter', $event)"
        @mouseleave="logFieldEvent(item.prop, 'template.onMouseleave', $event)"
        @compositionstart="logFieldEvent(item.prop, 'template.onCompositionstart', $event)"
        @compositionupdate="logFieldEvent(item.prop, 'template.onCompositionupdate', $event)"
        @compositionend="logFieldEvent(item.prop, 'template.onCompositionend', $event)"
      />
      <SchemaFormItem
        v-else
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
    </template>
  </ElForm>
  <pre
    class="mx-auto mt-3 max-h-[11.25rem] w-full max-w-[820px] overflow-auto rounded-lg border border-[var(--el-border-color-lighter)] bg-[var(--el-fill-color-lighter)] p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words tabular-nums"
  >{{ eventLogs.join('\n') || '暂无事件日志' }}</pre>
</template>
