<script setup lang="ts">
import type { FormRules } from 'element-plus'
import type { FormItem } from '@/components/SchemaFormItem'
import type { Condition } from '@/components/SchemaFormItem/types/condition'

interface DemoFormData {
  [key: string]: unknown
}

/** mountA / showB 与 A/B 均由同一套 formItems + SchemaFormItem 遍历渲染 */
const DEFAULT_FORM_DATA: DemoFormData = {
  mountA: true,
  showB: true,
  a: '',
  b: '',
  actions: '',
}

const { form: formData, formRef, loading, isDirty, validate, reset } = useForm<DemoFormData>(DEFAULT_FORM_DATA)

const rules: FormRules = {}

function resolveCondition(item: FormItem, data: DemoFormData): boolean {
  const c = item.condition as Condition | undefined
  if (c == null)
    return true
  return typeof c === 'function' ? c(data) : c
}

function resolveVisible(item: FormItem, data: DemoFormData): boolean {
  const v = item.visible as Condition | undefined
  if (v == null)
    return true
  return typeof v === 'function' ? v(data) : v
}

async function onSubmit() {
  await validate()
  ElMessage.success('显隐示例提交')
}

function onReset() {
  reset()
}

const formItems: FormItem[] = [
  {
    prop: 'mountA',
    label: '挂载字段 A（condition → 外层 v-if）',
    compType: 'switch',
    compProps: {
      inlinePrompt: true,
      activeText: '挂载',
      inactiveText: '卸载',
    },
  },
  {
    prop: 'showB',
    label: '显示字段 B（visible → 外层 v-show）',
    compType: 'switch',
    compProps: {
      inlinePrompt: true,
      activeText: '显示',
      inactiveText: '隐藏',
    },
  },
  {
    prop: 'a',
    label: '字段 A（随 mountA：卸载后 DOM 中不存在）',
    compType: 'input',
    compProps: { placeholder: '依赖上一项「挂载」' },
    condition: (data: Record<string, unknown>) => data.mountA === true,
  },
  {
    prop: 'b',
    label: '字段 B（随 showB：隐藏时仍在 DOM）',
    compType: 'input',
    compProps: { placeholder: '依赖上一项「显示」' },
    visible: (data: Record<string, unknown>) => data.showB === true,
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
]
</script>

<template>
  <ElAlert
    title="condition / visible 由外层 v-if / v-show 解析；表单项全部由 SchemaFormItem 遍历生成。"
    :description="`A：${formData.mountA === true ? '已挂载' : '未挂载（v-if 为假）'}；B：${formData.showB === true ? 'v-show 显示' : 'v-show 隐藏（仍挂载）'}`"
    type="info"
    :closable="false"
    class="mx-auto mb-3 w-full max-w-[820px]"
    show-icon
  />
  <ElForm
    ref="formRef"
    class="mx-auto w-full max-w-[820px]"
    :model="formData"
    :rules="rules"
    label-width="200px"
    @submit.prevent
  >
    <template v-for="item in formItems" :key="item.prop">
      <SchemaFormItem
        v-if="resolveCondition(item, formData)"
        v-show="resolveVisible(item, formData)"
        v-model="formData[item.prop]"
        :form-item="item"
      />
    </template>
  </ElForm>
  <pre
    class="mx-auto mt-4 max-h-[min(40vh,280px)] w-full max-w-[820px] overflow-auto rounded-lg border border-[var(--el-border-color-lighter)] bg-[var(--el-fill-color-light)] p-3 font-mono text-xs leading-relaxed tabular-nums"
  >{{ JSON.stringify(formData, null, 2) }}</pre>
</template>
