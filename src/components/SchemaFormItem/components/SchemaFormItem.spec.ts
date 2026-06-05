/**
 * SchemaFormItem 组件单元测试
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import SchemaFormItem from './SchemaFormItem.vue'

const StubInput = defineComponent({
  name: 'ElInput',
  props: {
    modelValue: { type: String, default: '' },
  },
  emits: ['update:modelValue', 'focus'],
  setup(props, { emit, attrs }) {
    return () => h('input', {
      class: 'stub-input',
      value: props.modelValue,
      onFocus: (event: FocusEvent) => {
        const onFocus = attrs.onFocus as ((event: FocusEvent) => void) | undefined
        onFocus?.(event)
        emit('focus', event)
      },
    })
  },
})

const StubFormItem = defineComponent({
  name: 'ElFormItem',
  props: {
    label: { type: String, default: '' },
  },
  setup(_props, { slots }) {
    return () => h('div', { class: 'el-form-item' }, slots.default?.())
  },
})

function mountSchemaFormItem(
  props: Record<string, unknown>,
  attrs: Record<string, unknown> = {},
  slots: Record<string, unknown> = {},
) {
  return mount(SchemaFormItem, {
    props,
    attrs,
    slots,
    global: {
      stubs: {
        ElFormItem: StubFormItem,
        ElInput: StubInput,
      },
    },
  })
}

describe('schemaFormItem', () => {
  it('renders input field with label defaults', () => {
    const wrapper = mountSchemaFormItem({
      formItem: { prop: 'name', label: '姓名', compType: 'input' },
      formData: {},
      modelValue: '张三',
    })

    expect(wrapper.find('.el-form-item').exists()).toBe(true)
    expect(wrapper.find('.stub-input').exists()).toBe(true)
  })

  it('does not mount when condition is false', () => {
    const wrapper = mountSchemaFormItem({
      formItem: {
        prop: 'hidden',
        label: '隐藏',
        compType: 'input',
        condition: false,
      },
      formData: {},
    })

    expect(wrapper.find('.el-form-item').exists()).toBe(false)
  })

  it('mounts but hides when visible is false', () => {
    const wrapper = mountSchemaFormItem({
      formItem: {
        prop: 'invisible',
        label: '不可见',
        compType: 'input',
        visible: false,
      },
      formData: {},
    })

    const formItem = wrapper.find('.el-form-item')
    expect(formItem.exists()).toBe(true)
    expect(formItem.isVisible()).toBe(false)
  })

  it('evaluates function condition and visible against formData', async () => {
    const wrapper = mountSchemaFormItem({
      formItem: {
        prop: 'city',
        label: '城市',
        compType: 'input',
        condition: (data: { showCity?: boolean }) => data.showCity === true,
        visible: (data: { showCity?: boolean }) => data.showCity === true,
      },
      formData: { showCity: false },
    })

    expect(wrapper.find('.el-form-item').exists()).toBe(false)

    await wrapper.setProps({
      formData: { showCity: true },
    })

    expect(wrapper.find('.el-form-item').exists()).toBe(true)
    expect(wrapper.find('.el-form-item').isVisible()).toBe(true)
  })

  it('prefers template event handlers over compProps handlers', async () => {
    const compPropsFocus = vi.fn()
    const templateFocus = vi.fn()

    const wrapper = mountSchemaFormItem(
      {
        formItem: {
          prop: 'x',
          label: '焦点',
          compType: 'input',
          compProps: {
            onFocus: compPropsFocus,
          },
        },
        formData: {},
      },
      { onFocus: templateFocus },
    )

    await wrapper.find('.stub-input').trigger('focus')

    expect(templateFocus).toHaveBeenCalledOnce()
    expect(compPropsFocus).not.toHaveBeenCalled()
  })
})
