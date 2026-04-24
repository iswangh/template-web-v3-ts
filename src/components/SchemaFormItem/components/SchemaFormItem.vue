<!-- eslint-disable ts/no-explicit-any -->
<script setup lang="ts">
import type { Slot } from 'vue'
import type { Condition, FormItem } from '../types'
import { ElFormItem } from 'element-plus'
import { computed, unref, useAttrs, useSlots } from 'vue'
import { COMP_DEFAULT_CONFIG, FORM_ITEM_COMP_MAP, FORM_ITEM_EXCLUDED_KEYS } from '../config'

interface ProcessedSlot {
  rawSlotName: string
  slotName: string
  slotFn: Slot
}

interface Props {
  formItem: FormItem
  formData: Record<string, any>
}

defineOptions({
  name: 'SchemaFormItem',
  // 监听器会在组件内分发：表单项属性给 ElFormItem，事件监听器给动态组件。
  inheritAttrs: false,
})

const props = defineProps<Props>()

const attrs = useAttrs()
const vueSlots = useSlots()
// ElFormItem 自身支持的插槽名；其余插槽视为动态组件插槽（如 prefix/suffix）
const FORM_ITEM_SLOT_NAMES = ['label', 'error', 'default'] as const

const modelValue = defineModel()

const formItemProps = computed(() => {
  return Object.fromEntries(
    Object.entries(props.formItem).filter(([key]) =>
      !FORM_ITEM_EXCLUDED_KEYS.includes(key as typeof FORM_ITEM_EXCLUDED_KEYS[number]),
    ),
  )
})

const nonEventAttrs = computed(() => {
  return Object.fromEntries(
    Object.entries(attrs).filter(([key]) => !key.startsWith('on')),
  )
})

const listenerAttrs = computed(() => {
  return Object.fromEntries(
    Object.entries(attrs).filter(([key, value]) => key.startsWith('on') && typeof value === 'function'),
  )
})

function normalizeSlots(
  slots: Record<string, unknown> | undefined,
  rawSlotNamePrefix: string,
): ProcessedSlot[] {
  if (!slots)
    return []

  const isSlotFn = (slotFn: unknown): slotFn is Slot => typeof slotFn === 'function'

  return Object.entries(slots)
    .filter(([, slotFn]) => isSlotFn(slotFn))
    .map(([slotName, slotFn]) => ({
      rawSlotName: `${rawSlotNamePrefix}-${slotName}`,
      slotName,
      slotFn: slotFn as Slot,
    }))
}

const formItemSlots = computed(() => {
  const all = normalizeSlots(props.formItem.slots, `form-item-${props.formItem.prop}`)
  return {
    named: all.filter(slot => slot.slotName !== 'default'),
    default: all.find(slot => slot.slotName === 'default'),
  }
})

// 模板提供的 FormItem 命名插槽（label/error），用于与配置化插槽做冲突裁剪。
const nativeFormItemSlotNames = computed(() => {
  return Object.entries(vueSlots)
    .filter(([slotName, slotFn]) => FORM_ITEM_SLOT_NAMES.includes(slotName as typeof FORM_ITEM_SLOT_NAMES[number]) && slotName !== 'default' && typeof slotFn === 'function')
    .map(([slotName]) => slotName)
})

const effectiveConfigFormItemNamedSlots = computed(() => {
  // 冲突策略：模板插槽优先；同名配置化插槽自动失效，避免重复渲染
  return formItemSlots.value.named.filter(slot => !nativeFormItemSlotNames.value.includes(slot.slotName))
})

const resolvedComp = computed(() => FORM_ITEM_COMP_MAP[props.formItem.compType] || 'div')

const processedCompProps = computed(() => {
  const defaults = COMP_DEFAULT_CONFIG.getDefaults(props.formItem)
  const compProps = props.formItem.compProps ?? {}
  const { optionsLoader: _optionsLoader, slots: _compSlots, ...restCompProps } = compProps as any

  const excludeEvents = (obj: Record<string, any>) =>
    Object.fromEntries(Object.entries(obj).filter(([key]) => !key.startsWith('on')))

  const compEventHandlers = Object.fromEntries(
    Object.entries(compProps).filter(([key, value]) => key.startsWith('on') && typeof value === 'function'),
  )

  const excludedDefaults = excludeEvents(defaults)
  const excludedRestCompProps = excludeEvents(restCompProps)

  return {
    ...excludedDefaults,
    ...excludedRestCompProps,
    // 配置化 compProps.onXxx 先铺底；模板上 @xxx 后合并，同名时模板事件优先
    ...compEventHandlers,
    ...listenerAttrs.value,
  }
})

function getDynamicCompSlots(prop: string) {
  const all = normalizeSlots(
    (props.formItem.compProps as { slots?: Record<string, unknown> } | undefined)?.slots,
    prop,
  )
  return all.length > 0 ? all : undefined
}

// 模板提供的动态组件插槽（prefix/suffix 等），用于与配置化动态插槽做冲突裁剪。
const nativeDynamicSlotNames = computed(() => {
  return Object.entries(vueSlots)
    .filter(([slotName, slotFn]) => !FORM_ITEM_SLOT_NAMES.includes(slotName as typeof FORM_ITEM_SLOT_NAMES[number]) && typeof slotFn === 'function')
    .map(([slotName]) => slotName)
})

const effectiveConfigDynamicSlots = computed(() => {
  const all = getDynamicCompSlots(props.formItem.prop) ?? []
  // 冲突策略：模板插槽优先；同名配置化动态插槽自动失效
  return all.filter(slot => !nativeDynamicSlotNames.value.includes(slot.slotName))
})

const conditionContext = computed(() => props.formData)

function evalCondition(rule: Condition | undefined, data: Record<string, unknown>): boolean {
  const r = unref(rule) as Condition | undefined
  if (r == null)
    return true
  if (typeof r === 'boolean')
    return r
  if (typeof r === 'function')
    return r(data)
  return true
}

/** condition → 根级 v-if（为假时不挂载，与表单项卸载语义一致）；支持布尔、函数，以及 ref/computed 包裹的布尔 */
const shouldMount = computed(() =>
  evalCondition(props.formItem.condition as Condition | undefined, conditionContext.value),
)

/** visible → 根级 v-show（为假时仍挂载，仅隐藏）；支持布尔、函数，以及 ref/computed 包裹的布尔 */
const shouldShow = computed(() =>
  evalCondition(props.formItem.visible as Condition | undefined, conditionContext.value),
)
</script>

<template>
  <template v-if="shouldMount">
    <ElFormItem v-show="shouldShow" v-bind="{ ...formItemProps, ...nonEventAttrs }">
      <!-- 1) 配置化 FormItem 命名插槽（已做同名去重：模板同名插槽优先） -->
      <template v-for="(slot, slotIndex) in effectiveConfigFormItemNamedSlots" :key="`${slot.rawSlotName}-${slotIndex}`" #[slot.slotName]="slotProps">
        <span v-if="slot.slotName === 'error'">
          <component :is="slot.slotFn" v-bind="{ value: modelValue, formItem, ...slotProps }" />
        </span>
        <component :is="slot.slotFn" v-else v-bind="{ value: modelValue, formItem, ...slotProps }" />
      </template>
      <!-- 2) 模板传入的 FormItem 命名插槽（label/error），优先级高于配置化同名插槽 -->
      <template v-for="(slotName, slotIndex) in nativeFormItemSlotNames" :key="`${slotName}-${slotIndex}`" #[slotName]="slotProps">
        <slot :name="slotName" v-bind="{ value: modelValue, formItem, ...slotProps }" />
      </template>

      <!-- 3) 组件主体渲染 -->
      <!-- 3.1 非 custom：渲染动态组件本体，并处理其动态插槽 -->
      <template v-if="formItem.compType !== 'custom'">
        <component
          :is="resolvedComp"
          v-bind="processedCompProps"
          v-model="modelValue"
        >
          <!-- 3.1.1 配置化动态插槽（已做同名去重：模板同名插槽优先） -->
          <template v-for="(slot, slotIndex) in effectiveConfigDynamicSlots" :key="`${slot.rawSlotName}-${slotIndex}`" #[slot.slotName]="slotProps">
            <component :is="slot.slotFn" v-bind="{ value: modelValue, formItem, ...slotProps }" />
          </template>
          <!-- 3.1.2 模板传入的动态插槽（prefix/suffix 等），优先级高于配置化同名插槽 -->
          <template v-for="(slotName, slotIndex) in nativeDynamicSlotNames" :key="`${slotName}-${slotIndex}`" #[slotName]="slotProps">
            <slot :name="slotName" v-bind="{ value: modelValue, formItem, ...slotProps }" />
          </template>
        </component>
      </template>

      <!-- 3.2 custom：主体内容仅由 default 槽位提供 -->
      <template v-else-if="formItem.compType === 'custom'">
        <!-- 3.2.1 模板 default 槽位优先 -->
        <slot v-if="vueSlots.default" v-bind="{ value: modelValue, formItem }" />
        <!-- 3.2.2 回退到配置化 default 槽位 -->
        <component
          :is="formItemSlots.default?.slotFn"
          v-else-if="formItemSlots.default"
          v-bind="{ value: modelValue, formItem }"
        />
      </template>
    </ElFormItem>
  </template>
</template>
