/**
 * usePointerCardTilt 单元测试
 */

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { usePointerCardTilt } from './usePointerCardTilt'

const gsapMocks = vi.hoisted(() => {
  const rotateXTo = vi.fn()
  const rotateYTo = vi.fn()
  const yTo = vi.fn()
  return {
    set: vi.fn(),
    quickTo: vi.fn(),
    killTweensOf: vi.fn(),
    rotateXTo,
    rotateYTo,
    yTo,
  }
})

const mediaQueryState = vi.hoisted(() => ({
  reducedMotion: { value: false },
  coarsePointer: { value: false },
}))

vi.mock('gsap', () => ({
  gsap: {
    set: (...args: unknown[]) => gsapMocks.set(...args),
    quickTo: (...args: unknown[]) => {
      gsapMocks.quickTo(...args)
      const prop = args[1]
      if (prop === 'rotationX')
        return gsapMocks.rotateXTo
      if (prop === 'rotationY')
        return gsapMocks.rotateYTo
      return gsapMocks.yTo
    },
    killTweensOf: (...args: unknown[]) => gsapMocks.killTweensOf(...args),
  },
}))

vi.mock('@vueuse/core', () => ({
  useMediaQuery: (query: string) => {
    if (query.includes('prefers-reduced-motion'))
      return mediaQueryState.reducedMotion
    if (query.includes('pointer: coarse'))
      return mediaQueryState.coarsePointer
    return { value: false }
  },
}))

describe('usePointerCardTilt', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mediaQueryState.reducedMotion.value = false
    mediaQueryState.coarsePointer.value = false
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0)
      return 1
    })
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
  })

  it('applies clamped rotation based on pointer position', async () => {
    let handlers: ReturnType<typeof usePointerCardTilt>

    const Comp = defineComponent({
      setup() {
        handlers = usePointerCardTilt({ maxAbsRotation: 5 })
        return handlers
      },
      template: `
        <div
          ref="cardRef"
          style="width: 200px; height: 100px;"
        />
      `,
    })

    const wrapper = mount(Comp, { attachTo: document.body })
    await nextTick()

    vi.spyOn(handlers!.cardRef.value!, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 200,
      height: 100,
    } as DOMRect)

    handlers!.onCardPointerEnter()
    handlers!.onCardPointerMove(new PointerEvent('pointermove', { clientX: 200, clientY: 0 }))

    expect(gsapMocks.rotateYTo).toHaveBeenCalledWith(5)
    expect(gsapMocks.rotateXTo).toHaveBeenCalledWith(5)

    wrapper.unmount()
  })

  it('skips tilt updates when prefers-reduced-motion is enabled', async () => {
    mediaQueryState.reducedMotion.value = true
    let handlers: ReturnType<typeof usePointerCardTilt>

    const Comp = defineComponent({
      setup() {
        handlers = usePointerCardTilt()
        return handlers
      },
      template: '<div ref="cardRef" />',
    })

    mount(Comp)
    await nextTick()

    gsapMocks.rotateXTo.mockClear()
    handlers!.onCardPointerMove(new PointerEvent('pointermove', { clientX: 100, clientY: 50 }))

    expect(gsapMocks.rotateXTo).not.toHaveBeenCalled()
  })

  it('reduces tilt intensity for coarse pointers', async () => {
    mediaQueryState.coarsePointer.value = true
    let handlers: ReturnType<typeof usePointerCardTilt>

    const Comp = defineComponent({
      setup() {
        handlers = usePointerCardTilt({
          rotateYFactor: 20,
          coarsePointerTiltScale: 0.5,
          maxAbsRotation: 20,
        })
        return handlers
      },
      template: '<div ref="cardRef" style="width: 200px; height: 100px;" />',
    })

    const wrapper = mount(Comp, { attachTo: document.body })
    await nextTick()

    vi.spyOn(handlers!.cardRef.value!, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 200,
      height: 100,
    } as DOMRect)

    handlers!.onCardPointerMove(new PointerEvent('pointermove', { clientX: 200, clientY: 50 }))

    expect(gsapMocks.rotateYTo).toHaveBeenCalledWith(5)
    wrapper.unmount()
  })
})
