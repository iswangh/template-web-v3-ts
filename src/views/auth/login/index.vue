<script setup lang="ts">
import type { FormRules } from 'element-plus'

interface LoginForm {
  username: string
  password: string
}

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const { form, formRef, submit, reset } = useForm<LoginForm>({
  username: '',
  password: '',
})

function onSubmit() {
  submit(async () => {
    // TODO: 接入登录接口
  })
}
</script>

<template>
  <div class="p-20px bg-white h-screen">
    <el-form ref="formRef" :model="form" :rules label-width="70px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" type="password" show-password />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">
          提交
        </el-button>
        <el-button @click="reset()">
          取消
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped></style>
