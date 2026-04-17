<script setup lang="ts">
import type { FormRules } from 'element-plus'
import { Lock, User } from '@element-plus/icons-vue'
import { RouterLink } from 'vue-router'
import { APP_NAME } from '@/config'

interface LoginForm {
  username: string
  password: string
}

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const { form, formRef, submit, loading } = useForm<LoginForm>({
  username: '',
  password: '',
})

const cardRef = ref<HTMLElement>()
let prefersReducedMotion = false
let animationId: number | null = null

const current = {
  rotateX: 0,
  rotateY: 0,
  lift: 0,
}

const target = {
  rotateX: 0,
  rotateY: 0,
  lift: 0,
}

function isSettled() {
  return Math.abs(current.rotateX - target.rotateX) < 0.01
    && Math.abs(current.rotateY - target.rotateY) < 0.01
    && Math.abs(current.lift - target.lift) < 0.01
}

function setCardTransform(transform: string) {
  if (!cardRef.value)
    return
  cardRef.value.style.transform = transform
}

function updateCardTransform() {
  setCardTransform(
    `perspective(1100px) translateY(${current.lift.toFixed(2)}px) rotateX(${current.rotateX.toFixed(2)}deg) rotateY(${current.rotateY.toFixed(2)}deg)`,
  )
}

function startAnimation() {
  if (animationId !== null || prefersReducedMotion)
    return

  const tick = () => {
    current.rotateX += (target.rotateX - current.rotateX) * 0.16
    current.rotateY += (target.rotateY - current.rotateY) * 0.16
    current.lift += (target.lift - current.lift) * 0.16
    updateCardTransform()

    if (isSettled()) {
      current.rotateX = target.rotateX
      current.rotateY = target.rotateY
      current.lift = target.lift
      updateCardTransform()
      animationId = null
      return
    }

    animationId = requestAnimationFrame(tick)
  }

  animationId = requestAnimationFrame(tick)
}

function onCardPointerEnter() {
  if (prefersReducedMotion)
    return
  target.lift = -4
  startAnimation()
}

function onCardPointerMove(event: PointerEvent) {
  if (prefersReducedMotion || !cardRef.value)
    return

  const rect = cardRef.value.getBoundingClientRect()
  const px = (event.clientX - rect.left) / rect.width
  const py = (event.clientY - rect.top) / rect.height

  target.rotateY = (px - 0.5) * 6
  target.rotateX = (0.5 - py) * 5
  target.lift = -4
  startAnimation()
}

function onCardPointerLeave() {
  target.rotateX = 0
  target.rotateY = 0
  target.lift = 0
  startAnimation()
}

onMounted(() => {
  prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

onUnmounted(() => {
  if (animationId !== null)
    cancelAnimationFrame(animationId)
})

function onSubmit() {
  submit(async () => {
    // TODO: 接入登录接口
  })
}
</script>

<template>
  <div class="login-page">
    <div aria-hidden="true" class="login-page__aurora" />
    <div aria-hidden="true" class="login-page__mesh" />

    <main class="login-page__main">
      <section
        ref="cardRef"
        aria-labelledby="login-title"
        class="login-page__card login-page__card--interactive"
        @pointerenter="onCardPointerEnter"
        @pointermove="onCardPointerMove"
        @pointerleave="onCardPointerLeave"
      >
        <header class="mb-2 text-center">
          <h1 id="login-title" class="m-0 text-7 fw-600 tracking--0.03em text-[#1d1d1feb]">
            {{ APP_NAME }}
          </h1>
          <p class="mt-2 text-3.75 leading-1.45 tracking--0.01em text-[#3c3c43bf]">
            请登录您的账户
          </p>
        </header>

        <el-form
          ref="formRef"
          class="login-form"
          :model="form"
          :rules
          label-position="top"
          :hide-required-asterisk="true"
          @submit.prevent="onSubmit"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="form.username"
              size="large"
              placeholder="用户名或邮箱"
              clearable
              autocomplete="username"
            >
              <template #prefix>
                <el-icon class="mr-0.5 text-4.5 text-[#3c3c436b]">
                  <User />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              size="large"
              type="password"
              placeholder="密码"
              show-password
              autocomplete="current-password"
            >
              <template #prefix>
                <el-icon class="mr-0.5 text-4.5 text-[#3c3c436b]">
                  <Lock />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <div class="mt-2 flex flex-col gap-2.5">
            <el-button
              class="login-primary-btn"
              type="primary"
              size="large"
              native-type="submit"
              :loading="loading"
            >
              登录
            </el-button>
            <p class="m-0 self-center px-3 py-1.5 text-3.5 tracking--0.01em text-[#3c3c43a8]">
              忘记密码？请联系管理员
            </p>
          </div>
        </el-form>

        <footer class="mt-6.5 border-t border-[#3c3c431a] pt-5.5 text-center text-3.5 tracking--0.01em text-[#3c3c438c]">
          <span class="mr-1.5">还没有账户？</span>
          <RouterLink to="/register" class="fw-600 text-[#0a84ff] no-underline hover:underline">
            注册
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
.login-page {
  --at-apply: relative min-h-100dvh flex items-center justify-center overflow-hidden px-5 py-10;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;

  &__aurora {
    --at-apply: pointer-events-none absolute inset--16%;
    background:
      radial-gradient(62% 56% at 18% 22%, rgb(134 140 255 / 19%) 0%, rgb(134 140 255 / 7%) 38%, transparent 78%),
      radial-gradient(50% 46% at 84% 16%, rgb(96 205 255 / 15%) 0%, rgb(96 205 255 / 5%) 34%, transparent 76%),
      radial-gradient(56% 50% at 74% 86%, rgb(194 157 255 / 13%) 0%, rgb(194 157 255 / 4%) 36%, transparent 78%),
      linear-gradient(168deg, rgb(244 246 250) 0%, rgb(233 238 245) 52%, rgb(223 232 243) 100%);
    filter: blur(10px) saturate(1.03);
    opacity: 0.95;
  }

  &__mesh {
    --at-apply: 'pointer-events-none absolute inset-0 opacity-32 mix-blend-multiply bg-[radial-gradient(circle_at_1px_1px,_rgb(15_23_42/7%)_1px,_transparent_1px)] [background-size:16px_16px]';
  }

  &__main {
    --at-apply: relative z-1 w-full max-w-102 flex flex-col gap-5;
  }

  &__card {
    --at-apply: rounded-6 border border-white/40 bg-white/58 p-8 backdrop-blur-8 backdrop-saturate-165;
    box-shadow:
      0 24px 80px rgb(0 0 0 / 12%),
      0 0 1px rgb(0 0 0 / 6%);
    transform: perspective(1100px) translateY(0) rotateX(0deg) rotateY(0deg);
    transform-origin: center;
  }

  &__card--interactive {
    transition: box-shadow 220ms ease;
    will-change: transform;

    &:hover {
      box-shadow:
        0 30px 90px rgb(15 23 42 / 16%),
        0 0 1px rgb(0 0 0 / 8%);
    }
  }
}

.login-form {
  --at-apply: mt-7;

  :deep(.el-form-item) {
    --at-apply: mb-4.5;
  }

  :deep(.el-form-item__label) {
    --at-apply: mb-2 text-3.25 fw-600 tracking--0.01em text-[#3c3c4399];
  }

  :deep(.el-input__inner) {
    --at-apply: text-4.25 tracking--0.02em;
  }

  :deep(.el-input__wrapper) {
    --at-apply: rounded-3 border border-transparent px-3.5 py-1.25;
  }

  :deep(.el-input__wrapper.is-focus) {
    --at-apply: border-[#0a84ff6b] bg-white/72 shadow-[0_0_0_3px_rgb(10_132_255/18%)];
  }
  .login-primary-btn {
    --at-apply: m-0 h-12 w-full rounded-3 border-none text-4.25 fw-600 tracking--0.02em bg-gradient-to-b from-[#0a84ff]
      to-[#0066d6] transition-all duration-180;
    box-shadow:
      0 1px 0 rgb(255 255 255 / 22%) inset,
      0 10px 24px rgb(10 132 255 / 28%);

    &:hover {
      --at-apply: brightness-104;
    }

    &:active {
      --at-apply: scale-99;
    }

    &:focus-visible {
      --at-apply: outline-none ring-2 ring-[#0a84ff66] ring-offset-2;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-page__card--interactive {
    transition: none;
  }
}
</style>
