/**
 * useAutoExpandOnHover 单元测试
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'
import { useAutoExpandOnHover } from './useAutoExpandOnHover'

describe('useAutoExpandOnHover', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('auto-expands after 500ms hover when enabled', async () => {
    const isExpanded = ref(false)
    const onToggleExpanded = vi.fn()
    const { onMouseEnter } = useAutoExpandOnHover(
      isExpanded,
      computed(() => true),
      onToggleExpanded,
    )

    onMouseEnter()
    vi.advanceTimersByTime(499)
    expect(onToggleExpanded).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(onToggleExpanded).toHaveBeenCalledWith(true)
  })

  it('does not auto-expand after manual toggle until mouse leave reset', async () => {
    const isExpanded = ref(false)
    const onToggleExpanded = vi.fn()
    const { onMouseEnter, onMouseLeave, recordManualToggle } = useAutoExpandOnHover(
      isExpanded,
      computed(() => true),
      onToggleExpanded,
    )

    recordManualToggle()
    onMouseEnter()
    vi.advanceTimersByTime(600)
    expect(onToggleExpanded).not.toHaveBeenCalled()

    onMouseLeave()
    await vi.runAllTimersAsync()
    onMouseEnter()
    vi.advanceTimersByTime(500)
    expect(onToggleExpanded).toHaveBeenCalledWith(true)
  })

  it('cleans up timers on unmount', () => {
    const isExpanded = ref(false)
    const onToggleExpanded = vi.fn()
    const { onMouseEnter } = useAutoExpandOnHover(
      isExpanded,
      computed(() => true),
      onToggleExpanded,
    )

    onMouseEnter()
    vi.advanceTimersByTime(200)
    vi.clearAllTimers()

    expect(() => vi.advanceTimersByTime(500)).not.toThrow()
  })
})
