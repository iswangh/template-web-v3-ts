<script setup lang="ts">
import type { FormRules } from 'element-plus'
import type { FormItem } from '@/components/SchemaFormItem'
import { SchemaFormItem } from '@/components/SchemaFormItem'
import { useForm } from '@/composables/form'

interface DemoFormData {
  [key: string]: unknown
}

const DEFAULT_FORM_DATA: DemoFormData = {
}

const { form: formData, formRef, loading, isDirty, validate, reset } = useForm<DemoFormData>(DEFAULT_FORM_DATA)

const formItems = ref<FormItem[]>([
  {
    prop: 'input',
    label: '输入框（配置化插槽）',
    compType: 'input',
    slots: {
      label: () => h('span', { style: 'color: var(--el-color-warning); font-weight: 600;' }, '配置化标签'),
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
    slots: {
      default: () => {
        const ElButtonComp = resolveComponent('ElButton')
        return h('div', { class: 'flex gap-2' }, [
          h(ElButtonComp, { type: 'primary', loading: loading.value, onClick: onSubmit }, () => '提交'),
          h(ElButtonComp, { disabled: !isDirty.value, onClick: onReset }, () => '重置'),
        ])
      },
    },
  },
])

const rules: FormRules = {}

async function onSubmit() {
  await validate()
  ElMessage.success('配置化插槽测试提交成功')
  // eslint-disable-next-line no-console
  console.log('config-slots-submit', { ...formData.value })
}

function onReset() {
  reset()
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
    />
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
