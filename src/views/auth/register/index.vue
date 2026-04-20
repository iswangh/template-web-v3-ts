<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { APP_NAME } from '@/config'

const {
  cardRef: tiltCardRef,
  onCardPointerEnter,
  onCardPointerMove,
  onCardPointerLeave,
} = usePointerCardTilt()
const dragContainerRef = ref<HTMLElement>()
const dragCardRef = ref<HTMLElement>()
const { isDragging: isCardDragging } = useDragPosition({
  storageKey: 'auth:register:card-position',
  storage: 'session',
  containerRef: dragContainerRef,
  targetRef: dragCardRef,
})
</script>

<template>
  <div ref="dragContainerRef" class="auth-page">
    <div aria-hidden="true" class="auth-page__aurora" />
    <div aria-hidden="true" class="auth-page__mesh" />

    <main class="auth-page__main">
      <section
        ref="dragCardRef"
        class="auth-page__card-drag-shell auth-page__card--draggable"
        :class="{ 'auth-page__card--dragging': isCardDragging }"
      >
        <div
          ref="tiltCardRef"
          aria-labelledby="register-title"
          class="auth-page__card auth-page__card--interactive"
          @pointerenter="onCardPointerEnter"
          @pointermove="onCardPointerMove"
          @pointerleave="onCardPointerLeave"
        >
          <header class="mb-2 text-center">
            <h1 id="register-title" class="m-0 text-7 fw-600 tracking--0.03em text-[#1d1d1feb]">
              {{ APP_NAME }}
            </h1>
            <p class="text-3.5 tracking--0.01em text-[#3c3c43bf]">
              创建新账户
            </p>
          </header>

          <p class="m-0 mt-7 text-center text-3.75 tracking--0.01em text-[#3c3c4399]">
            注册表单待接入
          </p>

          <footer class="mt-6.5 border-t border-[#3c3c431a] pt-5.5 text-center text-3.5 tracking--0.01em text-[#3c3c438c]">
            <span class="mr-1.5">已有账户？</span>
            <RouterLink to="/login" class="fw-600 text-[#0a84ff] no-underline hover:underline">
              登录
            </RouterLink>
          </footer>
        </div>
      </section>

      <p class="m-0 text-center text-3 tracking--0.01em text-[#3c3c436b]">
        继续即表示你同意服务条款与隐私说明
      </p>
    </main>
  </div>
</template>

<style lang="scss" scoped>
@use '../auth-page.scss' as *;

.auth-page__card--dragging {
  cursor: grabbing;
}

.auth-page__card-drag-shell {
  --at-apply: w-full;
  cursor: grab;
}
</style>
