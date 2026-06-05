/**
 * SchemaFormItem COMP_DEFAULT_CONFIG 单元测试
 */

import { describe, expect, it } from 'vitest'
import { COMP_DEFAULT_CONFIG } from './comp'

describe('cOMP_DEFAULT_CONFIG', () => {
  describe('getCompType', () => {
    it('classifies input, select, picker, and other components', () => {
      expect(COMP_DEFAULT_CONFIG.getCompType('input')).toBe('input')
      expect(COMP_DEFAULT_CONFIG.getCompType('input-number')).toBe('input')
      expect(COMP_DEFAULT_CONFIG.getCompType('select')).toBe('select')
      expect(COMP_DEFAULT_CONFIG.getCompType('tree-select')).toBe('select')
      expect(COMP_DEFAULT_CONFIG.getCompType('date-picker')).toBe('picker')
      expect(COMP_DEFAULT_CONFIG.getCompType('switch')).toBe('other')
    })
  })

  describe('generatePlaceholder', () => {
    it('generates input placeholders', () => {
      expect(COMP_DEFAULT_CONFIG.generatePlaceholder(
        { prop: 'name', label: '姓名', compType: 'input' },
        'input',
      )).toBe('请输入姓名')

      expect(COMP_DEFAULT_CONFIG.generatePlaceholder(
        { prop: 'age', label: '年龄', compType: 'input-number' },
        'input',
      )).toBe('请输入')
    })

    it('generates select and picker placeholders', () => {
      expect(COMP_DEFAULT_CONFIG.generatePlaceholder(
        { prop: 'city', label: '城市', compType: 'select' },
        'select',
      )).toBe('请选择城市')

      expect(COMP_DEFAULT_CONFIG.generatePlaceholder(
        { prop: 'date', label: '日期', compType: 'date-picker' },
        'picker',
      )).toBe('请选择日期')
    })

    it('returns empty string for other component types', () => {
      expect(COMP_DEFAULT_CONFIG.generatePlaceholder(
        { prop: 'flag', label: '开关', compType: 'switch' },
        'other',
      )).toBe('')
    })
  })

  describe('getDefaults', () => {
    it('merges generated defaults with user compProps', () => {
      const defaults = COMP_DEFAULT_CONFIG.getDefaults({
        prop: 'city',
        label: '城市',
        compType: 'select',
        compProps: { placeholder: '自定义占位', disabled: true },
      })

      expect(defaults.placeholder).toBe('自定义占位')
      expect(defaults.clearable).toBe(true)
      expect(defaults.filterable).toBe(true)
      expect(defaults.disabled).toBe(true)
    })
  })
})
