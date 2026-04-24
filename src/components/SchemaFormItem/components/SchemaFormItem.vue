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
  // 关闭自动透传：事件交给里面的输入组件，其它属性再手动分给表单项和输入框。
  inheritAttrs: false,
})

const props = defineProps<Props>()

const attrs = useAttrs()

/** 给 el-form-item 用的 props,去掉 FORM_ITEM_EXCLUDED_KEYS 里的字段 */
const formItemProps = computed(() => {
  return Object.fromEntries(
    Object.entries(props.formItem).filter(([key]) =>
      !FORM_ITEM_EXCLUDED_KEYS.includes(key as typeof FORM_ITEM_EXCLUDED_KEYS[number]),
    ),
  )
})

/**
 * 处理父组件写在标签上的 attrs：拆成表单项用的一份、内层控件用的一份。
 * nonEventAttrs：非 on*；eventAttrs：on* 且值为函数；on* 但非函数两边都不放。
 */
const processedAttrs = computed(() => {
  const nonEventAttrs: Record<string, unknown> = {}
  const eventAttrs: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(attrs)) {
    if (key.startsWith('on') && typeof value === 'function')
      eventAttrs[key] = value
    else if (!key.startsWith('on'))
      nonEventAttrs[key] = value
  }
  return { nonEventAttrs, eventAttrs }
})

/** 处理后的 el-form-item 的 attrs：schema 可透传字段 + 父级非事件属性 */
const formItemAttrs = computed(() => {
  return {
    ...formItemProps.value,
    ...processedAttrs.value.nonEventAttrs,
  }
})

/** 计算条件是否通过，支持布尔、函数（函数入参为当前表单的 formData） */
function evalCondition(rule?: Condition): boolean {
  const r = unref(rule)
  if (r == null)
    return true
  if (typeof r === 'boolean')
    return r
  if (typeof r === 'function')
    return r(props.formData)
  return true
}

/** 是否渲染（根据 condition 计算） */
const shouldMount = computed(() =>
  evalCondition(props.formItem.condition),
)

/** 是否显示（根据 visible 计算） */
const shouldShow = computed(() =>
  evalCondition(props.formItem.visible),
)

const modelValue = defineModel()

// 给里面真正的输入控件（输入框、下拉框等）绑的属性：默认值 + 配置里的 compProps；同一事件若配置和模板都写了，以模板为准。
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
    ...compEventHandlers,
    ...processedAttrs.value.eventAttrs,
  }
})

// --- 插槽：配置里写的和模板里写的，同名时以模板为准 ---
const slots = useSlots()

// 这几个名字是包在「表单项」上的插槽；其它名字认为是包在「里面的输入控件」上的（例如前缀、后缀）。
const FORM_ITEM_SLOT_NAMES = ['label', 'error', 'default'] as const

/**
 * 把配置里的 slots 对象转成数组，方便用列表渲染。
 * rawSlotName 只用来当列表的 key，多行表单时避免不同行的 key 撞在一起。
 */
function normalizeSlots(
  slotsRecord: Record<string, unknown> | undefined,
  rawSlotNamePrefix: string,
): ProcessedSlot[] {
  if (!slotsRecord)
    return []

  const isSlotFn = (slotFn: unknown): slotFn is Slot => typeof slotFn === 'function'

  return Object.entries(slotsRecord)
    .filter(([, slotFn]) => isSlotFn(slotFn))
    .map(([slotName, slotFn]) => ({
      rawSlotName: `${rawSlotNamePrefix}-${slotName}`,
      slotName,
      slotFn: slotFn as Slot,
    }))
}

// 配置里 formItem.slots：除了 default 以外的交给表单项（标签、错误文案等）；default 留给「自定义整格内容」那种类型用。
const formItemSlots = computed(() => {
  const all = normalizeSlots(props.formItem.slots, `form-item-${props.formItem.prop}`)
  return {
    named: all.filter(slot => slot.slotName !== 'default'),
    default: all.find(slot => slot.slotName === 'default'),
  }
})

// 父组件在模板里给表单项区域起了哪些插槽名（例如 label），用来和配置里的同名插槽二选一。
const nativeFormItemSlotNames = computed(() => {
  return Object.entries(slots)
    .filter(([slotName, slotFn]) => FORM_ITEM_SLOT_NAMES.includes(slotName as typeof FORM_ITEM_SLOT_NAMES[number]) && slotName !== 'default' && typeof slotFn === 'function')
    .map(([slotName]) => slotName)
})

const effectiveConfigFormItemNamedSlots = computed(() => {
  // 模板已经提供了的名字，配置里同名的就不再渲染，避免两套叠在一起。
  return formItemSlots.value.named.filter(slot => !nativeFormItemSlotNames.value.includes(slot.slotName))
})

// 根据类型选具体控件（输入框、下拉等）；类型表里没有时先用 div 顶着，避免页面白屏，真正用的类型应补进映射表。
const resolvedComp = computed(() => FORM_ITEM_COMP_MAP[props.formItem.compType] || 'div')

// 配置里 compProps.slots：画在「输入控件」上的插槽（和 formItem.slots 不是一层）；没配就当作没有。
function getDynamicCompSlots(prop: string) {
  const all = normalizeSlots(
    (props.formItem.compProps as { slots?: Record<string, unknown> } | undefined)?.slots,
    prop,
  )
  return all.length > 0 ? all : undefined
}

// 父组件在模板里给「输入控件」区域起了哪些插槽名，用来和 compProps.slots 里的同名做二选一。
const nativeDynamicSlotNames = computed(() => {
  return Object.entries(slots)
    .filter(([slotName, slotFn]) => !FORM_ITEM_SLOT_NAMES.includes(slotName as typeof FORM_ITEM_SLOT_NAMES[number]) && typeof slotFn === 'function')
    .map(([slotName]) => slotName)
})

const effectiveConfigDynamicSlots = computed(() => {
  const all = getDynamicCompSlots(props.formItem.prop) ?? []
  // 模板写了的名字，配置里同名的不再渲染。
  return all.filter(slot => !nativeDynamicSlotNames.value.includes(slot.slotName))
})
</script>

<template>
  <template v-if="shouldMount">
    <ElFormItem v-show="shouldShow" v-bind="formItemAttrs">
      <!-- 表单项区域：配置里的 label/error 等（模板已写的名字会跳过） -->
      <template v-for="(slot, slotIndex) in effectiveConfigFormItemNamedSlots" :key="`${slot.rawSlotName}-${slotIndex}`" #[slot.slotName]="slotProps">
        <span v-if="slot.slotName === 'error'">
          <component :is="slot.slotFn" v-bind="{ value: modelValue, formItem, ...slotProps }" />
        </span>
        <component :is="slot.slotFn" v-else v-bind="{ value: modelValue, formItem, ...slotProps }" />
      </template>
      <!-- 表单项区域：模板里写的 label/error 等，会盖住配置里的同名插槽 -->
      <template v-for="(slotName, slotIndex) in nativeFormItemSlotNames" :key="`${slotName}-${slotIndex}`" #[slotName]="slotProps">
        <slot :name="slotName" v-bind="{ value: modelValue, formItem, ...slotProps }" />
      </template>

      <!-- 中间输入区域 -->
      <!-- 预设类型：渲染具体控件 + 控件上的插槽 -->
      <template v-if="formItem.compType !== 'custom'">
        <component
          :is="resolvedComp"
          v-bind="processedCompProps"
          v-model="modelValue"
        >
          <!-- 控件上：配置里的插槽（模板已写的名字会跳过） -->
          <template v-for="(slot, slotIndex) in effectiveConfigDynamicSlots" :key="`${slot.rawSlotName}-${slotIndex}`" #[slot.slotName]="slotProps">
            <component :is="slot.slotFn" v-bind="{ value: modelValue, formItem, ...slotProps }" />
          </template>
          <!-- 控件上：模板里的插槽，会盖住配置里的同名插槽 -->
          <template v-for="(slotName, slotIndex) in nativeDynamicSlotNames" :key="`${slotName}-${slotIndex}`" #[slotName]="slotProps">
            <slot :name="slotName" v-bind="{ value: modelValue, formItem, ...slotProps }" />
          </template>
        </component>
      </template>

      <!-- 自定义整格：整块内容由 default 插槽决定 -->
      <template v-else-if="formItem.compType === 'custom'">
        <!-- 优先用模板里写的默认插槽 -->
        <slot v-if="slots.default" v-bind="{ value: modelValue, formItem }" />
        <!-- 模板没写时再用配置里的 default -->
        <component
          :is="formItemSlots.default?.slotFn"
          v-else-if="formItemSlots.default"
          v-bind="{ value: modelValue, formItem }"
        />
      </template>
    </ElFormItem>
  </template>
</template>
