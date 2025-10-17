<script setup lang='ts'>
import type { UserInfo } from '@/types'

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const { form, formRef, resetForm, validateForm } = useForm<UserInfo>()

const { login } = useUserStore()

const onLogin = async () => {
  await validateForm()
  login(form.value)
}

const reset = () => {
  resetForm()
}
</script>

<template>
  <div class="bg-white h-screen p-20">
    <el-form ref="formRef" :model="form" :rules="rules">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" placeholder="请输入密码" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onLogin">
          登录
        </el-button>
        <el-button @click="reset">
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped lang='scss'></style>
