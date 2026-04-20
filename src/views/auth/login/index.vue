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

const {
  cardRef: tiltCardRef,
  onCardPointerEnter: onCardTiltPointerEnter,
  onCardPointerMove: onCardTiltPointerMove,
  onCardPointerLeave: onCardTiltPointerLeave,
} = usePointerCardTilt({ hoverLift: 0 })

const dragContainerRef = ref<HTMLElement>()
const dragCardRef = ref<HTMLElement>()

const { isDragging: isCardDragging } = useDragPosition({
  storageKey: 'auth:login:card-position',
  storage: 'session',
  containerRef: dragContainerRef,
  targetRef: dragCardRef,
})

function onSubmit() {
  submit(async () => {
    // TODO: 接入登录接口
  })
}
</script>

<template>
  <div ref="dragContainerRef" class="auth-page">
    <div aria-hidden="true" class="auth-page__aurora" />
    <div aria-hidden="true" class="auth-page__mesh" />

    <main class="auth-page__main">
      <section
        ref="dragCardRef"
        class="auth-page__card-drag-shell auth-page__card--draggable" :class="[
          { 'auth-page__card--dragging': isCardDragging },
        ]"
      >
        <div
          ref="tiltCardRef"
          aria-labelledby="login-title"
          class="auth-page__card auth-page__card--interactive"
          @pointerenter="onCardTiltPointerEnter"
          @pointermove="onCardTiltPointerMove"
          @pointerleave="onCardTiltPointerLeave"
        >
          <header class="mb-2 text-center">
            <h1 id="login-title" class="m-0 text-7 fw-600 tracking--0.03em text-[#1d1d1feb]">
              {{ APP_NAME }}
            </h1>
            <p class="text-3.5 tracking--0.01em text-[#3c3c43bf]">
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
                <RouterLink to="/forgot-password" class="text-[#0a84ff] no-underline hover:underline">
                  忘记密码
                </RouterLink>
                ？也可联系管理员
              </p>
            </div>
          </el-form>

          <footer class="mt-6.5 border-t border-[#3c3c431a] pt-5.5 text-center text-3.5 tracking--0.01em text-[#3c3c438c]">
            <span class="mr-1.5">还没有账户？</span>
            <RouterLink to="/register" class="fw-600 text-[#0a84ff] no-underline hover:underline">
              注册
            </RouterLink>
          </footer>

          <p class="m-0 mt-5 text-center text-3 tracking--0.01em text-[#3c3c436b]">
            继续即表示你同意服务条款与隐私说明
          </p>
        </div>
      </section>
    </main>
  </div>
</template>

<style lang="scss" scoped>
@use '../auth-page.scss' as *;

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

.auth-page__card--dragging {
  cursor: grabbing;
}

.auth-page__card-drag-shell {
  --at-apply: w-full;
  cursor: grab;
}

.auth-page__card-drag-shell:is(.auth-page__card--dragging, .auth-page__card--dragging *) {
  cursor: grabbing;
}

.auth-page__card-drag-shell
  :is(input, textarea, select, button, a, [role='button'], .el-input__wrapper, .el-input__inner) {
  cursor: auto;
}

.auth-page__card-drag-shell :is(p, span, h1, h2, h3, h4, h5, h6, label) {
  cursor: text;
}
</style>
