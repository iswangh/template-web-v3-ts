<!-- eslint-disable ts/no-explicit-any -->
<script setup lang='ts'>
import type { FormItemProp } from 'element-plus'
import type { FormItem, FormItemExcludedKeys, FormProps } from './types'
import { checkCondition } from '../../utils'
import { FORM_ITEM_COMP_MAP, FORM_ITEM_EXCLUDED_KEYS } from './config'

interface FormEmits {
  (e: 'validate', prop: FormItemProp, isValid: boolean, message: string): void
  <T extends Record<string, any>, K extends keyof T>(e: 'change', prop: K, value: T[K], attr: FormItem): void
}

defineOptions({ name: 'ElementPlusKitForm' })

const props = withDefaults(defineProps<FormProps>(), {
  model: () => ({}),
})

const emit = defineEmits<FormEmits>()

const attrs = useAttrs()

const mergedAttrs = computed(() => ({ ...props, ...attrs }))

const filteredFormItems = computed(() => {
  return props.formItems.filter(item => checkCondition(item.vIf))
})

/**
 * 提取表单项的属性（排除特定的键）
 * @param item 表单项配置
 * @returns 不包含排除键的属性对象
 */
function extractFormItemProps<T extends FormItem>(item: T) {
  const excludedKeysSet = new Set(FORM_ITEM_EXCLUDED_KEYS)
  return Object.fromEntries(
    Object.entries(item).filter(([key]) => !excludedKeysSet.has(key as FormItemExcludedKeys)),
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
      v-for="(item, index) in filteredFormItems"
      v-show="checkCondition(item.vShow)"
      :key="`${item.prop}-${index}`"
      v-bind="extractFormItemProps(item)"
    >
      <!-- 标准组件 -->
      <template v-if="item.comp !== 'custom'">
        <component
          :is="getComponentType(item.comp)"
          v-bind="item.compAttrs"
          v-model="model[item.prop]"
          @change="(value: any) => emit('change', item.prop, value, item)"
        />
      </template>
      <!-- 自定义组件 -->
      <template v-else>
        <slot :name="item.prop" :item="item" :value="model[item.prop]" :form="model" />
      </template>
    </el-form-item>
  </el-form>
</template>
