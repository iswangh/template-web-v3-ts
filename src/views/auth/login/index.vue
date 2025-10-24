<script setup lang='ts'>
import type { FormRules } from 'element-plus'
import type { FormItem, FormItems } from '@/components/element-plus-kit/form'
import type { UserInfo } from '@/types'
import { Form } from '@/components/element-plus-kit/form'

const formItems: FormItems = [
  {
    label: '用户名',
    prop: 'username',
    comp: 'input',
  },
  {
    label: '密码',
    prop: 'password',
    comp: 'input',
  },
  {
    label: '性别',
    prop: 'sex',
    comp: 'radio',
    compAttrs: {
      options: [
        { label: '男', value: '1' },
        { label: '女', value: '2' },
      ],
    },
  },
  {
    label: '爱好',
    prop: 'hobby',
    comp: 'select',
    compAttrs: {
      options: [
        { label: '吃饭', value: '1' },
        { label: '睡觉', value: '2' },
        { label: '打游戏', value: '3' },
      ],
    },
  },
]

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const { form } = useForm<UserInfo>({ })

// const { form, formRef, resetForm, validateForm } = useForm<UserInfo>()

// const { login } = useUserStore()

// const onLogin = async () => {
//   await validateForm()
//   login(form.value)
// }

// const reset = () => {
//   resetForm()
// }

function onChange(prop: string, val: string, attr: FormItem) {
  console.log('page onChange', prop, val, attr)
}
</script>

<template>
  <div class="p-20px bg-white h-screen">
    <Form :model="form" :form-items="formItems" :rules @change="onChange" />
  </div>
</template>

<style scoped lang='scss'></style>
