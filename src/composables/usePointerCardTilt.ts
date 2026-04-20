import { gsap } from 'gsap'

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

export interface UsePointerCardTiltOptions {
  /** 指针横向位置对 rotationY 的系数（与原实现 `(px - 0.5) * rotateYFactor` 一致） */
  rotateYFactor?: number
  /** 指针纵向位置对 rotationX 的系数（与原实现 `(0.5 - py) * rotateXFactor` 一致） */
  rotateXFactor?: number
  /** 悬停/移动时沿 Y 轴平移（像素，负值表示上浮） */
  hoverLift?: number
  /** GSAP quickTo 动画时长（秒） */
  duration?: number
  /** GSAP 缓动 */
  ease?: string
  /** transform 透视（像素） */
  perspective?: number
  /**
   * 限制单轴最终旋转绝对值（度），避免调大系数后在四角过猛；
   * 不传则不额外钳制。
   */
  maxAbsRotation?: number
  /** 检测到 `(pointer: coarse)`（触控等）时，对倾斜与上浮强度的乘数 */
  coarsePointerTiltScale?: number
}

/**
 * 卡片随指针位置轻微 3D 倾斜；尊重 prefers-reduced-motion，卸载时停止 GSAP 动画。
 * pointermove 合并到 rAF，减轻高频事件与布局抖动带来的卡顿感。
 */
export function usePointerCardTilt(options: UsePointerCardTiltOptions = {}) {
  const {
    rotateYFactor = 6,
    rotateXFactor = 5,
    hoverLift = -4,
    duration = 0.45,
    ease = 'power3.out',
    perspective = 1100,
    maxAbsRotation,
    coarsePointerTiltScale = 0.62,
  } = options

  const cardRef = ref<HTMLElement>()
  let prefersReducedMotion = false
  let tiltIntensity = 1
  let hoverLiftScaled = hoverLift
  let rotateXTo: ((value: number) => gsap.core.Tween) | null = null
  let rotateYTo: ((value: number) => gsap.core.Tween) | null = null
  let yTo: ((value: number) => gsap.core.Tween) | null = null

  let moveRafId: number | null = null
  let lastClientX = 0
  let lastClientY = 0

  function clampRotation(value: number) {
    if (maxAbsRotation === undefined)
      return value
    return Math.min(maxAbsRotation, Math.max(-maxAbsRotation, value))
  }

  function flushPointerTilt() {
    moveRafId = null
    if (!cardRef.value || !rotateXTo || !rotateYTo || !yTo)
      return

    const rect = cardRef.value.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0)
      return

    const px = clamp01((lastClientX - rect.left) / rect.width)
    const py = clamp01((lastClientY - rect.top) / rect.height)

    const rawY = (px - 0.5) * rotateYFactor * tiltIntensity
    const rawX = (0.5 - py) * rotateXFactor * tiltIntensity

    rotateYTo(clampRotation(rawY))
    rotateXTo(clampRotation(rawX))
    yTo(hoverLiftScaled)
  }

  function schedulePointerTilt(event: PointerEvent) {
    lastClientX = event.clientX
    lastClientY = event.clientY
    if (moveRafId != null)
      return
    moveRafId = requestAnimationFrame(flushPointerTilt)
  }

  function cancelScheduledTilt() {
    if (moveRafId != null) {
      cancelAnimationFrame(moveRafId)
      moveRafId = null
    }
  }

  function onCardPointerEnter() {
    if (prefersReducedMotion || !yTo)
      return
    yTo(hoverLiftScaled)
  }

  function onCardPointerMove(event: PointerEvent) {
    if (prefersReducedMotion || !cardRef.value || !rotateXTo || !rotateYTo || !yTo)
      return

    schedulePointerTilt(event)
  }

  function onCardPointerLeave() {
    cancelScheduledTilt()

    if (!rotateXTo || !rotateYTo || !yTo)
      return

    rotateXTo(0)
    rotateYTo(0)
    yTo(0)
  }

  onMounted(() => {
    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isCoarse = window.matchMedia('(pointer: coarse)').matches
    tiltIntensity = isCoarse ? coarsePointerTiltScale : 1
    hoverLiftScaled = hoverLift * tiltIntensity

    if (!cardRef.value || prefersReducedMotion)
      return

    gsap.set(cardRef.value, {
      transformPerspective: perspective,
      transformOrigin: 'center',
      force3D: true,
    })

    rotateXTo = gsap.quickTo(cardRef.value, 'rotationX', { duration, ease })
    rotateYTo = gsap.quickTo(cardRef.value, 'rotationY', { duration, ease })
    yTo = gsap.quickTo(cardRef.value, 'y', { duration, ease })
  })

  onUnmounted(() => {
    cancelScheduledTilt()

    if (cardRef.value)
      gsap.killTweensOf(cardRef.value)

    rotateXTo = null
    rotateYTo = null
    yTo = null
  })

  return {
    cardRef,
    onCardPointerEnter,
    onCardPointerMove,
    onCardPointerLeave,
  }
}
