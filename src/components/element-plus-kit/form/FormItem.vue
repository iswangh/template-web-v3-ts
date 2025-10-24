<!-- eslint-disable ts/no-explicit-any -->
<script setup lang='ts'>
import type { FormItem } from './types'
import { COMPONENT_DEFAULT_CONFIG, FORM_ITEM_COMP_MAP, FORM_ITEM_EXCLUDED_KEYS } from './config'

interface ProcessedSlot {
  rawSlotName: string
  slotName: string
  slotFn: Slot
}

interface FormSlots {
  formItemSlots: ProcessedSlot[]
  dynamicComponentSlots: Map<string, ProcessedSlot[]>
}

interface Props {
  formItem: FormItem
  formData?: Record<string, any>
  formSlots?: FormSlots
}

interface Emits {
  <T extends Record<string, any>, K extends keyof T>(e: 'change', prop: K, value: T[K], attr: FormItem): void
}

defineOptions({ name: 'ElementPlusKitFormItem' })

const props = withDefaults(defineProps<Props>(), {
  formData: () => ({}),
  formSlots: () => ({ formItemSlots: [], dynamicComponentSlots: new Map() }),
})

defineEmits<Emits>()

const modelValue = defineModel()

const formItemProps = computed(() => extractFormItemProps())

const formItemSlots = computed(() => props.formSlots.formItemSlots)

const dynamicComponentSlots = computed(() => (prop: string) => props.formSlots.dynamicComponentSlots.get(prop))

const resolvedComponent = computed(() => FORM_ITEM_COMP_MAP[props.formItem.comp] || 'div')

/**
 * 提取表单项的属性（排除特定的键）
 * @returns 不包含排除键的属性对象
 */
function extractFormItemProps() {
  const excludedKeysSet = new Set(FORM_ITEM_EXCLUDED_KEYS)
  return Object.fromEntries(
    Object.entries(props.formItem).filter(([key]) => !excludedKeysSet.has(key as typeof FORM_ITEM_EXCLUDED_KEYS[number])),
  )
}

/**
 * 处理后的组件属性 - 使用配置化方案
 */
const processedCompAttrs = computed(() => {
  return COMPONENT_DEFAULT_CONFIG.getDefaults(props.formItem)
})
</script>

<template>
  <el-form-item v-bind="formItemProps">
    <!-- el-form-item slots -->
    <template v-for="(slot, slotIndex) in formItemSlots" :key="`${slot.rawSlotName}-${slotIndex}`" #[slot.slotName]="slotProps">
      <component :is="slot.slotFn" :value="modelValue" :form="formData" :form-item="formItem" v-bind="slotProps" />
    </template>
    <!-- 标准组件 -->
    <template v-if="formItem.comp !== 'custom'">
      <component
        :is="resolvedComponent"
        v-bind="processedCompAttrs"
        v-model="modelValue"
        @change="$emit('change', formItem.prop, $event, formItem)"
      >
        <!-- dynamic component slots -->
        <template v-for="(slot, slotIndex) in dynamicComponentSlots(formItem.prop)" :key="`${slot.rawSlotName}-${slotIndex}`" #[slot.slotName]="slotProps">
          <component :is="slot.slotFn" :value="modelValue" :form="formData" :form-item="formItem" v-bind="slotProps" />
        </template>
      </component>
    </template>
    <!-- 自定义组件 -->
    <template v-else>
      <slot :name="formItem.prop" :value="modelValue" :form="formData" :form-item="formItem" />
    </template>
  </el-form-item>
</template>
