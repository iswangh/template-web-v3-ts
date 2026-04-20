import type { Ref } from 'vue'
import { useDraggable } from '@vueuse/core'
import { gsap } from 'gsap'

interface DragPosition {
  x: number
  y: number
}

type PositionStorage = 'session' | 'local'

export interface UseDragPositionOptions {
  /** 可选：传入后才会启用位置缓存；不传则只在当前页面实例内生效 */
  storageKey?: string
  /** 可选：存储后端，支持 session 或 local；仅在传入 storageKey 时生效 */
  storage?: PositionStorage
  /** 拖动边界容器 */
  containerRef: Ref<HTMLElement | undefined>
  /** 被拖动元素 */
  targetRef: Ref<HTMLElement | undefined>
  /** 命中这些元素时不触发拖动，保留原生交互 */
  ignoreDragSelector?: string
  /** 首次进入页面时的默认位置 */
  defaultPosition?: DragPosition
}

const DEFAULT_IGNORE_DRAG_SELECTOR = 'input,textarea,select,button,a,[role="button"],.el-input__wrapper,.el-input__inner,p,span,h1,h2,h3,h4,h5,h6,label'

function readPositionFromStorage(
  storage: PositionStorage,
  storageKey: string,
  fallback: DragPosition,
): DragPosition {
  if (typeof window === 'undefined')
    return fallback

  try {
    const storageApi = storage === 'local' ? window.localStorage : window.sessionStorage
    const raw = storageApi.getItem(storageKey)
    if (!raw)
      return fallback

    const parsed = JSON.parse(raw) as Partial<DragPosition>
    if (typeof parsed.x !== 'number' || typeof parsed.y !== 'number')
      return fallback

    return { x: parsed.x, y: parsed.y }
  }
  catch {
    return fallback
  }
}

function persistPosition(
  storage: PositionStorage,
  storageKey: string,
  position: DragPosition,
) {
  if (typeof window === 'undefined')
    return

  try {
    const storageApi = storage === 'local' ? window.localStorage : window.sessionStorage
    storageApi.setItem(storageKey, JSON.stringify(position))
  }
  catch {
    // 边界场景：隐私模式或存储配额异常时不阻断页面交互。
  }
}

export function useDragPosition(options: UseDragPositionOptions) {
  const {
    storageKey,
    storage = 'session',
    containerRef,
    targetRef,
    ignoreDragSelector = DEFAULT_IGNORE_DRAG_SELECTOR,
    defaultPosition = { x: 0, y: 0 },
  } = options

  const position = ref<DragPosition>({ ...defaultPosition })
  const dragStartPointerX = ref(0)
  const dragStartPointerY = ref(0)
  const dragStartTranslateX = ref(0)
  const dragStartTranslateY = ref(0)

  function applyPosition(nextPosition: DragPosition) {
    if (!targetRef.value)
      return

    gsap.set(targetRef.value, {
      x: nextPosition.x,
      y: nextPosition.y,
      force3D: true,
    })
  }

  function persistCurrentPosition() {
    if (!storageKey)
      return
    persistPosition(storage, storageKey, position.value)
  }

  const { isDragging } = useDraggable(targetRef, {
    preventDefault: false,
    containerElement: containerRef,
    onStart: (_, event) => {
      const target = event.target as HTMLElement | null
      if (!target)
        return

      // 业务目的：右键仍保留浏览器原生上下文菜单，用户可直接复制文本。
      if (event.button === 2)
        return false

      const shouldIgnoreDrag = target.closest(ignoreDragSelector)
      if (shouldIgnoreDrag)
        return false

      dragStartPointerX.value = event.clientX
      dragStartPointerY.value = event.clientY
      dragStartTranslateX.value = position.value.x
      dragStartTranslateY.value = position.value.y
    },
    onMove: (_, event) => {
      if (!targetRef.value)
        return

      const deltaX = event.clientX - dragStartPointerX.value
      const deltaY = event.clientY - dragStartPointerY.value
      position.value = {
        x: dragStartTranslateX.value + deltaX,
        y: dragStartTranslateY.value + deltaY,
      }
      applyPosition(position.value)
    },
    onEnd: () => {
      persistCurrentPosition()
    },
  })

  onMounted(() => {
    if (storageKey)
      position.value = readPositionFromStorage(storage, storageKey, defaultPosition)
    applyPosition(position.value)
  })

  onUnmounted(() => {
    persistCurrentPosition()
  })

  return {
    isDragging,
    position,
    persistCurrentPosition,
  }
}
