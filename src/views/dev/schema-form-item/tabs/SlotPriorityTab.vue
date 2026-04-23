<script setup lang="ts">
import type { FormRules } from 'element-plus'
import type { FormItem } from '@/components/SchemaFormItem'

interface DemoFormData {
  [key: string]: unknown
}

const DEFAULT_FORM_DATA: DemoFormData = { x: '', actions: '' }

const { form: formData, formRef, loading, isDirty, validate, reset } = useForm<DemoFormData>(DEFAULT_FORM_DATA)

const rules: FormRules = {}

async function onSubmit() {
  await validate()
  ElMessage.success('插槽优先级示例提交')
}

function onReset() {
  reset()
}

const formItems: FormItem[] = [
  {
    prop: 'x',
    label: '配置化 label 文案',
    compType: 'input',
    slots: {
      label: () => h('span', { style: 'color: var(--el-color-warning); font-weight: 600;' }, '配置化 label（应被模板覆盖）'),
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
]
</script>

<template>
  <ElAlert
    title="同名插槽：模板 #label 优先于 formItem.slots.label"
    type="info"
    :closable="false"
    class="mb-3 w-full max-w-[820px]"
  />
  <ElForm
    ref="formRef"
    class="mx-auto w-full max-w-[820px]"
    :model="formData"
    :rules="rules"
    label-width="160px"
    @submit.prevent
  >
    <SchemaFormItem
      v-for="item in formItems"
      :key="item.prop"
      v-model="formData[item.prop]"
      :form-item="item"
    >
      <template v-if="item.prop === 'x'" #label="{ formItem: fi }">
        <span style="color: var(--el-color-primary); font-weight: 600">{{ fi.label }}（模板生效）</span>
      </template>
    </SchemaFormItem>
  </ElForm>
</template>
