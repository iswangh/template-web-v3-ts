<script setup lang="ts">
import type { FormRules } from 'element-plus'
import type { FormItem } from '@/components/SchemaFormItem'

interface DemoFormData {
  [key: string]: unknown
}

const DEFAULT_FORM_DATA: DemoFormData = { x: '', actions: '' }

const { form: formData, formRef, loading, isDirty, validate, reset } = useForm<DemoFormData>(DEFAULT_FORM_DATA)

const rules: FormRules = {}

function onTemplateFocus() {
  ElMessage.warning('模板 @focus（若未被覆盖则会弹出）')
}

async function onSubmit() {
  await validate()
  ElMessage.success('事件优先级示例提交')
}

function onReset() {
  reset()
}

const formItems: FormItem[] = [
  {
    prop: 'x',
    label: '焦点',
    compType: 'input',
    compProps: {
      onFocus: () => {
        ElMessage.info('来自 compProps.onFocus（配置化在后，覆盖模板 @focus）')
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
          h(Btn, { disabled: !isDirty.value, onClick: onReset }, () => '重置'),
        ])
      },
    },
  },
]
</script>

<template>
  <ElAlert
    title="同名事件：compProps.onFocus 在合并对象中位于模板监听器之后，会覆盖 @focus"
    type="info"
    :closable="false"
    class="mb-3 w-full max-w-[820px]"
  />
  <ElForm
    ref="formRef"
    class="mx-auto w-full max-w-[820px]"
    :model="formData"
    :rules="rules"
    label-width="120px"
    @submit.prevent
  >
    <template v-for="item in formItems" :key="item.prop">
      <SchemaFormItem
        v-if="item.prop === 'x'"
        v-model="formData[item.prop]"
        :form-item="item"
        @focus="onTemplateFocus"
      />
      <SchemaFormItem
        v-else
        v-model="formData[item.prop]"
        :form-item="item"
      />
    </template>
  </ElForm>
</template>
