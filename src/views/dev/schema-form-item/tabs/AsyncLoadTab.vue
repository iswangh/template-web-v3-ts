<script setup lang="ts">
import type { FormRules } from 'element-plus'
import type { FormItem } from '@/components/SchemaFormItem'
import { SchemaFormItem, useLoadOptions } from '@/components/SchemaFormItem'
import { useForm } from '@/composables/form'

interface DemoFormData {
  [key: string]: unknown
}

const DEFAULT_FORM_DATA: DemoFormData = {
  dept: '',
  post: '',
}

const { form: formData, formRef, loading, isDirty, validate, reset } = useForm<DemoFormData>(DEFAULT_FORM_DATA)

const formItems = ref<FormItem[]>([
  {
    prop: 'dept',
    label: '部门',
    compType: 'select',
    compProps: {
      optionsLoader: async () => {
        await new Promise(resolve => setTimeout(resolve, 800))
        return [
          { label: '北京（异步）', value: 'bj' },
          { label: '上海（异步）', value: 'sh' },
          { label: '广州（异步）', value: 'gz' },
        ]
      },
    },
  },
  {
    prop: 'post',
    label: '岗位',
    compType: 'select-v2',
    compProps: {
      optionsLoader: async (data: DemoFormData) => {
        if (data?.dept !== 'sh')
          return []
        await new Promise(resolve => setTimeout(resolve, 1200))
        return [
          { label: '上海-浦东（联动异步）', value: 'pd' },
          { label: '上海-徐汇（联动异步）', value: 'xh' },
          { label: '上海-静安（联动异步）', value: 'ja' },
        ]
      },
    },
  },
])
const { loading: optionsLoading, loadOptions } = useLoadOptions(formItems.value, formData.value as Record<string, unknown>)

const rules: FormRules = {}

function clearSelectV2Options() {
  const selectV2Item = formItems.value.find(item => item.prop === 'post')
  selectV2Item?.compProps && (selectV2Item.compProps.options = [])
}

watch(() => formData.value.dept, async (value) => {
  if (value === 'sh') {
    await loadOptions('post')
    return
  }
  formData.value.post = ''
  clearSelectV2Options()
}, { immediate: true })

onMounted(() => {
  void loadOptions('dept')
})

async function onSubmit() {
  await validate()
  ElMessage.success('异步加载测试提交成功')
  // eslint-disable-next-line no-console
  console.log('async-submit', { ...formData.value })
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
    <ElFormItem>
      <ElButton :loading="optionsLoading" @click="loadOptions(['dept', 'post'])">
        重新加载下拉选项
      </ElButton>
      <ElButton type="primary" :loading="loading" @click="onSubmit">
        提交
      </ElButton>
      <ElButton :disabled="!isDirty" @click="onReset">
        重置
      </ElButton>
    </ElFormItem>
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
