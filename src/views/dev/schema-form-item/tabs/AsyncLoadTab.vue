<script setup lang="ts">
import type { FormRules } from 'element-plus'
import type { FormItems } from '@/components/SchemaFormItem'
import { useLoadOptions } from '@/components/SchemaFormItem'

interface DemoFormData {
  [key: string]: unknown
}

const DEFAULT_FORM_DATA: DemoFormData = {
  dept: '',
  post: '',
}

const { form: formData, formRef, loading, isDirty, validate, reset } = useForm<DemoFormData>(DEFAULT_FORM_DATA)

const formItems = reactive([
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
  { prop: 'actions', label: '', compType: 'custom', class: 'actions-row' },
]) as FormItems
const { loading: optionsLoading, loadOptions } = useLoadOptions(formItems, formData.value as Record<string, unknown>)

const rules: FormRules = {}

function clearSelectV2Options() {
  const selectV2Item = formItems.find(item => item.prop === 'post')
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

onMounted(() => loadOptions('dept'))

async function onSubmit() {
  await validate()
  ElMessage.success('异步加载测试提交成功')
  // eslint-disable-next-line no-console
  console.log('async-submit', { ...formData.value })
}
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
    >
      <template v-if="item.prop === 'actions'">
        <div class="flex flex-wrap gap-2">
          <ElButton :loading="optionsLoading" @click="() => void loadOptions(['dept', 'post'])">
            重新加载下拉选项
          </ElButton>
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
