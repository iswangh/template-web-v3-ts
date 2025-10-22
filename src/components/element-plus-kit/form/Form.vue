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

export interface FormItemSlotScope {
  value: any
  form: Record<string, any>
  formItem: FormItem
  [key: string]: any // 允许 el-form-item 的其他作用域参数
}

export interface FormSlots {
  /**
   * FormItem 通用插槽
   * @example #form-item-label
   */
  [key: `form-item-${string}`]: (props: FormItemSlotScope) => any

  /**
   * 动态组件插槽
   * @example #username-prefix, #email-suffix
   */
  [key: `${string}-${string}`]: (props: FormItemSlotScope) => any

  /**
   * 自定义组件插槽
   * @example #custom-field
   */
  [key: string]: (props: FormItemSlotScope) => any
}

defineOptions({ name: 'ElementPlusKitForm' })

const props = withDefaults(defineProps<Props>(), {
  model: () => ({}),
})

const emit = defineEmits<FormEmits>()

defineSlots<FormSlots>()

const attrs = useAttrs()

const slots = useSlots()

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

/**
 * 获取动态组件对应的插槽
 * @param prefix 动态组件名称前缀
 * @returns 动态组件插槽配置数组
 */
function getSlotsByPrefix(prefix: string) {
  const result = []
  for (const name in slots) {
    if (name.startsWith(prefix)) {
      result.push({
        rawSlotName: name,
        slotName: name.replace(prefix, ''),
        slotFn: slots[name],
      })
    }
  }
  return result
}

/**
 * el-form-item(default插槽除外) 和 动态组件的插槽缓存
 */
const slotsCache = computed(() => {
  const formItemSlots = getSlotsByPrefix('form-item-')
  const dynamicComponentSlots = new Map()

  // 缓存字段插槽
  for (const item of filteredFormItems.value) {
    const fieldSlots = getSlotsByPrefix(`${item.prop}-`)
    if (fieldSlots.length > 0) {
      dynamicComponentSlots.set(item.prop, fieldSlots)
    }
  }

  return { formItemSlots, dynamicComponentSlots }
})

const formItemSlots = computed(() => slotsCache.value.formItemSlots)

const dynamicComponentSlots = computed(() => (prop: string) => slotsCache.value.dynamicComponentSlots.get(prop))
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
      <!-- el-form-item slots -->
      <template v-for="(slot, slotIndex) in formItemSlots" :key="`${slot.rawSlotName}-${slotIndex}`" #[slot.slotName]="slotProps">
        <component :is="slot.slotFn" :value="model[v.prop]" :form="model" :form-item="v" v-bind="slotProps" />
      </template>
      <!-- 标准组件 -->
      <template v-if="v.comp !== 'custom'">
        <component
          :is="getComponentType(v.comp)"
          v-bind="v.compAttrs"
          v-model="model[v.prop]"
          @change="(value: any) => emit('change', v.prop, value, v)"
        >
          <!-- dynamic component slots -->
          <template v-for="(slot, slotIndex) in dynamicComponentSlots(v.prop)" :key="`${slot.rawSlotName}-${slotIndex}`" #[slot.slotName]="slotProps">
            <component :is="slot.slotFn" :value="model[v.prop]" :form="model" :form-item="v" v-bind="slotProps" />
          </template>
        </component>
      </template>
      <!-- 自定义组件 -->
      <template v-else>
        <slot :name="v.prop" :value="model[v.prop]" :form="model" :form-item="v" />
      </template>
    </el-form-item>
  </el-form>
</template>
