<!-- eslint-disable ts/no-explicit-any -->
<script setup lang='ts'>
import type { FormItemProp } from 'element-plus'
import type { ElFormAttrs, FormItem, FormItems, FormItemSlotScope } from './types'
import { checkCondition } from '../../utils'
import FormItemComponent from './FormItem.vue'

interface Props extends ElFormAttrs {
  formItems: FormItems
  gutter?: InstanceType<typeof ElRow>['gutter']
}

interface Emits {
  (e: 'validate', prop: FormItemProp, isValid: boolean, message: string): void
  <T extends Record<string, any>, K extends keyof T>(e: 'change', prop: K, value: T[K], attr: FormItem): void
}

interface Slots {
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

defineEmits<Emits>()

defineSlots<Slots>()

const attrs = useAttrs()

const slots = useSlots()

const mergedAttrs = computed(() => {
  const { formItems: _, ...rest } = props
  return { ...rest, showMessage: true, ...attrs }
})

const filteredFormItems = computed(() => {
  return props.formItems.filter(v => checkCondition({ condition: v.vIf, data: props.model, defaultValue: true }))
})

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
        slotFn: slots[name]!,
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
</script>

<template>
  <el-form
    v-bind="mergedAttrs"
    :model="model"
    @validate="(prop, isValid, message) => $emit('validate', prop, isValid, message)"
    @submit.prevent
  >
    <FormItemComponent
      v-for="(v, index) in filteredFormItems"
      v-show="checkCondition({ condition: v.vShow, data: props.model, defaultValue: true })"
      :key="`${v.prop}-${index}`"
      v-model="model[v.prop]"
      :form-item="v"
      :form-data="model"
      :form-slots="slotsCache"
      @change="(_, value) => $emit('change', v.prop, value, v)"
    />
  </el-form>
</template>
