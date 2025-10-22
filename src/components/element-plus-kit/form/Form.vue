<!-- eslint-disable ts/no-explicit-any -->
<script setup lang='ts'>
import type { FormItemProp } from 'element-plus'
import type { ElFormAttrs, FormItem, FormItems } from './types'
import { checkCondition } from '../../utils'
import { FORM_ITEM_COMP_MAP, FORM_ITEM_EXCLUDED_KEYS } from './config'

interface Props extends ElFormAttrs {
  formItems: FormItems
}

interface FormEmits {
  (e: 'validate', prop: FormItemProp, isValid: boolean, message: string): void
  <T extends Record<string, any>, K extends keyof T>(e: 'change', prop: K, value: T[K], attr: FormItem): void
}

defineOptions({ name: 'ElementPlusKitForm' })

const props = withDefaults(defineProps<Props>(), {
  model: () => ({}),
})

const emit = defineEmits<FormEmits>()

const attrs = useAttrs()

const mergedAttrs = computed(() => {
  const { formItems: _, ...rest } = props
  return { ...rest, ...attrs }
})

const filteredFormItems = computed(() => {
  return props.formItems.filter(v => checkCondition({ condition: v.vIf, data: props.model, defaultValue: true }))
})

/**
 * 提取表单项的属性（排除特定的键）
 * @param item 表单项配置
 * @returns 不包含排除键的属性对象
 */
function extractFormItemProps<T extends FormItem>(item: T) {
  const excludedKeysSet = new Set(FORM_ITEM_EXCLUDED_KEYS)
  return Object.fromEntries(
    Object.entries(item).filter(([key]) => !excludedKeysSet.has(key as typeof FORM_ITEM_EXCLUDED_KEYS[number])),
  )
}

function getComponentType(comp: keyof typeof FORM_ITEM_COMP_MAP) {
  return FORM_ITEM_COMP_MAP[comp] || 'div'
}
</script>

<template>
  <el-form
    v-bind="mergedAttrs"
    :model="model"
    @validate="(prop, isValid, message) => emit('validate', prop, isValid, message)"
    @submit.prevent
  >
    <el-form-item
      v-for="(v, index) in filteredFormItems"
      v-show="checkCondition({ condition: v.vShow, data: props.model, defaultValue: true })"
      :key="`${v.prop}-${index}`"
      v-bind="extractFormItemProps(v)"
    >
      <!-- 标准组件 -->
      <template v-if="v.comp !== 'custom'">
        <component
          :is="getComponentType(v.comp)"
          v-bind="v.compAttrs"
          v-model="model[v.prop]"
          @change="(value: any) => emit('change', v.prop, value, v)"
        />
      </template>
      <!-- 自定义组件 -->
      <template v-else>
        <slot :name="v.prop" :item="v" :value="model[v.prop]" :form="model" />
      </template>
    </el-form-item>
  </el-form>
</template>
