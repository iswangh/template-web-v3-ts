<!-- eslint-disable ts/no-explicit-any -->
<script setup lang="ts">
import type { Slot } from 'vue'
import type { FormItem, FormItemEventExtendedParams } from '../types'
import { ElFormItem } from 'element-plus'
import { computed, nextTick, useSlots, watch } from 'vue'
import { useChangeEventState } from '../composables'
import { COMP_DEFAULT_CONFIG, FORM_ITEM_COMP_MAP, FORM_ITEM_EXCLUDED_KEYS } from '../config'

interface ProcessedSlot {
  rawSlotName: string
  slotName: string
  slotFn: Slot
}

interface FormSlots {
  formItemSlots: Map<string, ProcessedSlot[]>
  dynamicCompSlots: Map<string, ProcessedSlot[]>
}

interface Props {
  formItem: FormItem
  index: number
  formData?: Record<string, any>
  dynamicCompEvents: Record<string, (...args: any[]) => any>
  formSlots?: FormSlots
}

interface Emits {
  <T extends Record<string, any>, K extends keyof T>(e: 'change', extendedParams: Omit<FormItemEventExtendedParams, 'index'>, value: T[K]): void
}

defineOptions({ name: 'SchemaFormItem' })

const props = withDefaults(defineProps<Props>(), {
  formData: () => ({}),
  formSlots: () => ({ formItemSlots: new Map(), dynamicCompSlots: new Map() }),
})

const emit = defineEmits<Emits>()
const vueSlots = useSlots()
const FORM_ITEM_SLOT_NAMES = ['label', 'error', 'default'] as const

const modelValue = defineModel()

const formItemProps = computed(() => {
  return Object.fromEntries(
    Object.entries(props.formItem).filter(([key]) =>
      !FORM_ITEM_EXCLUDED_KEYS.includes(key as typeof FORM_ITEM_EXCLUDED_KEYS[number]),
    ),
  )
})

const formItemSlots = computed(() => {
  const all = props.formSlots.formItemSlots.get(props.formItem.prop) ?? []
  return {
    named: all.filter(slot => slot.slotName !== 'default'),
    default: all.find(slot => slot.slotName === 'default'),
  }
})

const nativeFormItemSlotNames = computed(() => {
  return Object.entries(vueSlots)
    .filter(([slotName, slotFn]) => FORM_ITEM_SLOT_NAMES.includes(slotName as typeof FORM_ITEM_SLOT_NAMES[number]) && slotName !== 'default' && typeof slotFn === 'function')
    .map(([slotName]) => slotName)
})

const effectiveConfigFormItemNamedSlots = computed(() => {
  return formItemSlots.value.named.filter(slot => !nativeFormItemSlotNames.value.includes(slot.slotName))
})

const resolvedComp = computed(() => FORM_ITEM_COMP_MAP[props.formItem.compType] || 'div')

const eventExtendedParams = computed(() => ({
  prop: props.formItem.prop,
  formItem: props.formItem,
  index: props.index,
}))

const dynamicEventHandlers = computed(() => {
  return Object.fromEntries(
    Object.entries(props.dynamicCompEvents).map(([eventName, handler]) => [
      eventName,
      (...args: any[]) => handler(eventExtendedParams.value, ...args),
    ]),
  )
})

const changeEventState = useChangeEventState()

function onChange(event: any) {
  changeEventState.start()
  emit('change', eventExtendedParams.value, event)
  nextTick(() => changeEventState.end())
}

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
    ...dynamicEventHandlers.value,
    ...compEventHandlers,
  }
})

function getDynamicCompSlots(prop: string) {
  const all = props.formSlots.dynamicCompSlots.get(prop) ?? []
  return all.length > 0 ? all : undefined
}

const nativeDynamicSlotNames = computed(() => {
  return Object.entries(vueSlots)
    .filter(([slotName, slotFn]) => !FORM_ITEM_SLOT_NAMES.includes(slotName as typeof FORM_ITEM_SLOT_NAMES[number]) && typeof slotFn === 'function')
    .map(([slotName]) => slotName)
})

const effectiveConfigDynamicSlots = computed(() => {
  const all = getDynamicCompSlots(props.formItem.prop) ?? []
  return all.filter(slot => !nativeDynamicSlotNames.value.includes(slot.slotName))
})

watch(
  () => modelValue.value,
  (newValue, oldValue) => {
    if (changeEventState.isUserInteractionDuring)
      return
    if (newValue !== oldValue)
      emit('change', eventExtendedParams.value, newValue)
  },
)
</script>

<template>
  <ElFormItem v-bind="formItemProps">
    <template v-for="(slot, slotIndex) in effectiveConfigFormItemNamedSlots" :key="`${slot.rawSlotName}-${slotIndex}`" #[slot.slotName]="slotProps">
      <span v-if="slot.slotName === 'error'">
        <component :is="slot.slotFn" v-bind="{ value: modelValue, form: formData, formItem, ...slotProps }" />
      </span>
      <component :is="slot.slotFn" v-else v-bind="{ value: modelValue, form: formData, formItem, ...slotProps }" />
    </template>
    <template v-for="slotName in nativeFormItemSlotNames" :key="`native-form-item-${slotName}`" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="{ value: modelValue, form: formData, formItem, ...slotProps }" />
    </template>
    <template v-if="formItem.compType !== 'custom'">
      <component
        :is="resolvedComp"
        v-bind="processedCompProps"
        v-model="modelValue"
        @change="onChange"
      >
        <template v-for="(slot, slotIndex) in effectiveConfigDynamicSlots" :key="`${slot.rawSlotName}-${slotIndex}`" #[slot.slotName]="slotProps">
          <component :is="slot.slotFn" v-bind="{ value: modelValue, form: formData, formItem, ...slotProps }" />
        </template>
        <template v-for="slotName in nativeDynamicSlotNames" :key="`native-dynamic-${slotName}`" #[slotName]="slotProps">
          <slot :name="slotName" v-bind="{ value: modelValue, form: formData, formItem, ...slotProps }" />
        </template>
      </component>
    </template>
    <template v-else-if="formItem.compType === 'custom'">
      <slot v-if="vueSlots.default" v-bind="{ value: modelValue, form: formData, formItem }" />
      <component
        :is="formItemSlots.default?.slotFn"
        v-else-if="formItemSlots.default"
        v-bind="{ value: modelValue, form: formData, formItem }"
      />
    </template>
  </ElFormItem>
</template>
