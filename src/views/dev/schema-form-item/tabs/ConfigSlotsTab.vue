<script setup lang="ts">
import type { FormRules } from 'element-plus'
import type { FormItem } from '@/components/SchemaFormItem'

interface DemoFormData {
  [key: string]: unknown
}

const DEFAULT_FORM_DATA: DemoFormData = {
  input: '',
}

const { form: formData, formRef, loading, isDirty, validate, reset } = useForm<DemoFormData>(DEFAULT_FORM_DATA)

const rules: FormRules = {}

async function onSubmit() {
  await validate()
  ElMessage.success('配置化插槽测试提交成功')
  // eslint-disable-next-line no-console
  console.log('config-slots-submit', { ...formData.value })
}

const formItems: FormItem[] = [
  {
    prop: 'input',
    label: '输入框（配置化插槽）',
    compType: 'input',
    slots: {
      label: () => h('span', { style: 'color: var(--el-color-warning); font-weight: 600;' }, '配置化插槽'),
    },
    compProps: {
      slots: {
        prefix: () => h('span', { style: 'color: var(--el-color-primary);' }, '@'),
      },
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
          h(Btn, { disabled: !isDirty.value, onClick: reset }, () => '重置'),
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
    />
  </ElForm>
  <pre
    class="mx-auto mt-4 max-h-[min(40vh,280px)] w-full max-w-[820px] overflow-auto rounded-lg border border-[var(--el-border-color-lighter)] bg-[var(--el-fill-color-light)] p-3 font-mono text-xs leading-relaxed tabular-nums"
  >{{ JSON.stringify(formData, null, 2) }}</pre>
</template>
