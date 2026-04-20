import { useMediaQuery } from '@vueuse/core'
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
    rotateYFactor = 20,
    rotateXFactor = 14,
    hoverLift = -4,
    duration = 0.45,
    ease = 'power3.out',
    perspective = 1100,
    maxAbsRotation,
    coarsePointerTiltScale = 0.75,
  } = options
  const normalizedMaxAbsRotation = maxAbsRotation == null
    ? undefined
    : Math.max(0, Math.abs(maxAbsRotation))

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
  let stopEnvironmentWatch: (() => void) | null = null
  // 避免媒体查询频繁触发时重复创建 quickTo，确保初始化与销毁成对出现。
  let isTiltRuntimeReady = false
  const prefersReducedMotionQuery = useMediaQuery('(prefers-reduced-motion: reduce)')
  const isCoarsePointerQuery = useMediaQuery('(pointer: coarse)')

  function clampRotation(value: number) {
    if (normalizedMaxAbsRotation == null || normalizedMaxAbsRotation === 0)
      return value
    return Math.min(normalizedMaxAbsRotation, Math.max(-normalizedMaxAbsRotation, value))
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
  }

  function schedulePointerTilt(event: PointerEvent) {
    lastClientX = event.clientX
    lastClientY = event.clientY
    if (moveRafId != null)
      return
    // 将高频 pointermove 合并到下一帧，降低事件抖动与主线程压力。
    moveRafId = requestAnimationFrame(flushPointerTilt)
  }

  function cancelScheduledTilt() {
    if (moveRafId != null) {
      cancelAnimationFrame(moveRafId)
      moveRafId = null
    }
  }

  function setupTiltRuntime() {
    if (!cardRef.value || isTiltRuntimeReady)
      return

    // 统一在运行时入口设置 3D 上下文，避免调用方样式差异导致的表现不一致。
    gsap.set(cardRef.value, {
      transformPerspective: perspective,
      transformOrigin: 'center',
      force3D: true,
    })

    rotateXTo = gsap.quickTo(cardRef.value, 'rotationX', { duration, ease })
    rotateYTo = gsap.quickTo(cardRef.value, 'rotationY', { duration, ease })
    yTo = gsap.quickTo(cardRef.value, 'y', { duration, ease })
    isTiltRuntimeReady = true
  }

  function teardownTiltRuntime() {
    cancelScheduledTilt()
    if (cardRef.value) {
      // 用户切换为 reduced-motion 时立即归零，避免保留中间倾斜状态影响可读性。
      gsap.killTweensOf(cardRef.value)
      gsap.set(cardRef.value, { rotationX: 0, rotationY: 0, y: 0 })
    }

    rotateXTo = null
    rotateYTo = null
    yTo = null
    isTiltRuntimeReady = false
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

  function updateEnvironmentPreferences() {
    prefersReducedMotion = prefersReducedMotionQuery.value
    const isCoarse = isCoarsePointerQuery.value
    tiltIntensity = isCoarse ? coarsePointerTiltScale : 1
    hoverLiftScaled = hoverLift * tiltIntensity

    if (prefersReducedMotion)
      teardownTiltRuntime()
    else
      // 动态开关系统设置后无需重进页面即可恢复交互。
      setupTiltRuntime()
  }

  // 由 VueUse 管理媒体查询监听与释放，watch 只关心业务状态联动。
  stopEnvironmentWatch = watch(
    [prefersReducedMotionQuery, isCoarsePointerQuery],
    updateEnvironmentPreferences,
    { immediate: true },
  )

  onMounted(() => {
    // watch 的 immediate 可能早于元素 ref 挂载，这里在挂载后再同步一次，确保可初始化倾斜运行时。
    updateEnvironmentPreferences()
  })

  onUnmounted(() => {
    stopEnvironmentWatch?.()
    stopEnvironmentWatch = null
    teardownTiltRuntime()
  })

  return {
    cardRef,
    onCardPointerEnter,
    onCardPointerMove,
    onCardPointerLeave,
  }
}
