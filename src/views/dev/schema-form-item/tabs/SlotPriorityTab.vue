<script setup lang="ts">
import type { FormRules } from 'element-plus'
import type { FormItems } from '@/components/SchemaFormItem'

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

const formItems: FormItems = [
  {
    prop: 'x',
    label: '输入框',
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
  },
]
</script>

<template>
  <ElForm
    ref="formRef"
    class="mx-auto w-full max-w-[820px]"
    :model="formData"
    :rules="rules"
    label-width="160px"
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
      <template v-if="item.prop === 'x'" #label="{ formItem: { label } }">
        <span style="color: var(--el-color-primary); font-weight: 600">{{ label }}（模板生效）</span>
      </template>
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
</template>
