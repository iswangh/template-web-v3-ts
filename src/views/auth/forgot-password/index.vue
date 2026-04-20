<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { APP_NAME } from '@/config'

const {
  cardRef,
  onCardPointerEnter,
  onCardPointerMove,
  onCardPointerLeave,
} = usePointerCardTilt()
</script>

<template>
  <div class="auth-page">
    <div aria-hidden="true" class="auth-page__aurora" />
    <div aria-hidden="true" class="auth-page__mesh" />

    <main class="auth-page__main">
      <section
        ref="cardRef"
        aria-labelledby="forgot-password-title"
        class="auth-page__card auth-page__card--interactive"
        @pointerenter="onCardPointerEnter"
        @pointermove="onCardPointerMove"
        @pointerleave="onCardPointerLeave"
      >
        <header class="mb-2 text-center">
          <h1 id="forgot-password-title" class="m-0 text-7 fw-600 tracking--0.03em text-[#1d1d1feb]">
            {{ APP_NAME }}
          </h1>
          <p class="mt-2 text-3.75 leading-1.45 tracking--0.01em text-[#3c3c43bf]">
            找回密码
          </p>
        </header>

        <p class="m-0 mt-7 text-center text-3.75 leading-1.5 tracking--0.01em text-[#3c3c4399]">
          流程待接入；也可联系管理员处理。
        </p>

        <footer class="mt-6.5 border-t border-[#3c3c431a] pt-5.5 text-center text-3.5 tracking--0.01em text-[#3c3c438c]">
          <RouterLink to="/login" class="fw-600 text-[#0a84ff] no-underline hover:underline">
            返回登录
          </RouterLink>
        </footer>
      </section>

      <p class="m-0 text-center text-3 leading-1.5 tracking--0.01em text-[#3c3c436b]">
        继续即表示你同意服务条款与隐私说明
      </p>
    </main>
  </div>
</template>

<style lang="scss" scoped>
@import '../auth-page.scss';
</style>
