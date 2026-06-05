/**
 * useLoadOptions 单元测试
 */

import { describe, expect, it, vi } from 'vitest'
import { useLoadOptions } from './useLoadOptions'

describe('useLoadOptions', () => {
  function createFormItems() {
    return [
      {
        prop: 'city',
        label: '城市',
        compType: 'select',
        compProps: {
          optionsLoader: vi.fn().mockResolvedValue([
            { label: '北京', value: 'bj' },
          ]),
        },
      },
      {
        prop: 'district',
        label: '区县',
        compType: 'select',
        compProps: {
          optionsLoader: vi.fn().mockRejectedValue(new Error('load failed')),
        },
      },
      {
        prop: 'name',
        label: '姓名',
        compType: 'input',
        compProps: {},
      },
    ]
  }

  it('loads options for a single field on success', async () => {
    const formItems = createFormItems()
    const { loadOptions, getOptions, loading } = useLoadOptions(formItems, { province: '1' })

    await loadOptions('city')

    expect(loading.value).toBe(false)
    expect(formItems[0].compProps.options).toEqual([{ label: '北京', value: 'bj' }])
    expect(formItems[0].compProps.optionsLoader).toHaveBeenCalledWith({ province: '1' })
    expect(getOptions('city')).toEqual([{ label: '北京', value: 'bj' }])
  })

  it('sets empty options when loader fails', async () => {
    const formItems = createFormItems()
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { loadOptions, getOptions } = useLoadOptions(formItems)

    await loadOptions('district')

    expect(formItems[1].compProps.options).toEqual([])
    expect(getOptions('district')).toEqual([])
    consoleError.mockRestore()
  })

  it('loads multiple fields and returns grouped options', async () => {
    const formItems = [
      {
        prop: 'a',
        compType: 'select',
        compProps: {
          options: [{ label: 'A', value: 'a' }],
          optionsLoader: vi.fn(),
        },
      },
      {
        prop: 'b',
        compType: 'select',
        compProps: {
          optionsLoader: vi.fn().mockResolvedValue([{ label: 'B', value: 'b' }]),
        },
      },
    ]
    const { loadOptions, getOptions } = useLoadOptions(formItems)

    await loadOptions(['b'])

    expect(getOptions(['a', 'b'])).toEqual([
      { prop: 'a', options: [{ label: 'A', value: 'a' }] },
      { prop: 'b', options: [{ label: 'B', value: 'b' }] },
    ])
  })

  it('loads all fields with optionsLoader when props omitted', async () => {
    const loader = vi.fn().mockResolvedValue([{ label: 'X', value: 'x' }])
    const formItems = [
      { prop: 'x', compType: 'select', compProps: { optionsLoader: loader } },
    ]
    const { loadOptions } = useLoadOptions(formItems)

    await loadOptions()

    expect(loader).toHaveBeenCalledOnce()
    expect(formItems[0].compProps.options).toEqual([{ label: 'X', value: 'x' }])
  })
})
