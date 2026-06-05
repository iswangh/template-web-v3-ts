/**
 * useDragPosition 单元测试
 */

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { useDragPosition } from './useDragPosition'

const gsapSet = vi.fn()
const draggableOptions = vi.hoisted(() => ({ current: null as Record<string, unknown> | null }))

vi.mock('gsap', () => ({
  gsap: {
    set: (...args: unknown[]) => gsapSet(...args),
  },
}))

vi.mock('@vueuse/core', () => ({
  useDraggable: (_target: unknown, options: Record<string, unknown>) => {
    draggableOptions.current = options
    return { isDragging: { value: false } }
  },
}))

describe('useDragPosition', () => {
  beforeEach(() => {
    gsapSet.mockClear()
    sessionStorage.clear()
    draggableOptions.current = null
  })

  it('restores position from sessionStorage on mount', async () => {
    sessionStorage.setItem('drag:test', JSON.stringify({ x: 12, y: 34 }))

    const Comp = defineComponent({
      setup() {
        const containerRef = ref<HTMLElement>()
        const targetRef = ref<HTMLElement>()
        useDragPosition({
          storageKey: 'drag:test',
          storage: 'session',
          containerRef,
          targetRef,
          defaultPosition: { x: 0, y: 0 },
        })
        return { containerRef, targetRef }
      },
      template: `
        <div ref="containerRef">
          <div ref="targetRef">drag me</div>
        </div>
      `,
    })

    mount(Comp)
    await nextTick()

    expect(gsapSet).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ x: 12, y: 34 }),
    )
  })

  it('persists position on drag end when storageKey is provided', async () => {
    const Comp = defineComponent({
      setup() {
        const containerRef = ref<HTMLElement>()
        const targetRef = ref<HTMLElement>()
        useDragPosition({
          storageKey: 'drag:end',
          storage: 'session',
          containerRef,
          targetRef,
        })
        return { containerRef, targetRef }
      },
      template: `
        <div ref="containerRef">
          <div ref="targetRef">drag me</div>
        </div>
      `,
    })

    mount(Comp)
    await nextTick()

    draggableOptions.current?.onStart?.({}, { target: document.createElement('div'), clientX: 0, clientY: 0, button: 0 })
    draggableOptions.current?.onMove?.({}, { clientX: 20, clientY: 10 })
    draggableOptions.current?.onEnd?.()

    expect(sessionStorage.getItem('drag:end')).toBe(JSON.stringify({ x: 20, y: 10 }))
  })

  it('ignores drag start on ignored interactive elements', () => {
    mount(defineComponent({
      setup() {
        const containerRef = ref<HTMLElement>()
        const targetRef = ref<HTMLElement>()
        useDragPosition({
          containerRef,
          targetRef,
          ignoreDragSelector: 'button',
        })
        return { containerRef, targetRef }
      },
      template: '<div ref="containerRef"><button ref="targetRef">btn</button></div>',
    }))

    const button = document.createElement('button')
    const result = draggableOptions.current?.onStart?.({}, {
      target: button,
      clientX: 0,
      clientY: 0,
      button: 0,
    })

    expect(result).toBe(false)
  })
})
