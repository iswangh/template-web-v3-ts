<script setup lang="ts">
import type { FormRules } from 'element-plus'
import type { FormItem } from '@/components/SchemaFormItem'

interface DemoFormData {
  [key: string]: unknown
}

/** mountA / showB 与 A/B 均由同一套 formItems + SchemaFormItem 遍历渲染 */
const formItems: FormItem[] = [
  {
    prop: 'mountA',
    label: '挂载字段 A',
    compType: 'switch',
    compProps: {
      inlinePrompt: true,
      activeText: '挂载',
      inactiveText: '卸载',
    },
  },
  {
    prop: 'showB',
    label: '显示字段 B',
    compType: 'switch',
    compProps: {
      inlinePrompt: true,
      activeText: '显示',
      inactiveText: '隐藏',
    },
  },
  {
    prop: 'a',
    label: '字段 A',
    compType: 'input',
    compProps: { placeholder: '依赖上一项「挂载」' },
    condition: ({ mountA }) => mountA === true,
  },
  {
    prop: 'b',
    label: '字段 B',
    compType: 'input',
    compProps: { placeholder: '依赖上一项「显示」' },
    visible: ({ showB }) => showB === true,
  },
  {
    prop: 'conditionBooleanDemo',
    label: 'condition 布尔值示例',
    compType: 'input',
    compProps: { placeholder: 'condition: true（固定挂载）' },
    condition: true,
  },
  {
    prop: 'visibleBooleanDemo',
    label: 'visible 布尔值示例',
    compType: 'input',
    compProps: { placeholder: 'visible: false（固定隐藏）' },
    visible: false,
  },
  { prop: 'actions', label: '', compType: 'custom', class: 'actions-row' },
]

const DEFAULT_FORM_DATA: DemoFormData = {
  mountA: true,
  showB: true,
  a: '',
  b: '',
  conditionBooleanDemo: '',
  visibleBooleanDemo: '',
}

const { form: formData, formRef, loading, isDirty, validate, reset } = useForm<DemoFormData>(DEFAULT_FORM_DATA)

const rules: FormRules = {}

async function onSubmit() {
  await validate()
  ElMessage.success('显隐示例提交')
}
</script>

<template>
  <ElForm
    ref="formRef"
    class="mx-auto w-full max-w-[820px]"
    :model="formData"
    :rules="rules"
    label-width="200px"
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
