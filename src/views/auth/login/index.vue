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
    compAttrs: {
      clearable: true,
      placeholder: '请输入用户名',
    },
  },
]

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const { form } = useForm<UserInfo>({ username: '123' })

console.log('page form', form.value)

watch(
  () => form.value,
  (form) => {
    console.log('watch page form', form)
  },
  {
    deep: true,
    immediate: true,
  },
)
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
    <strong>model</strong>
    <Form :model="form" :form-items="formItems" :rules @change="onChange" />
    <strong>v-model</strong>
    <Form v-model="form" :model="form" :form-items="formItems" :rules>
      <template #username="{ item, value, form: _form }">
        <div>
          <div>item - {{ item }}</div>
          <div>value - {{ value }}</div>
          <div>form - {{ _form }}</div>
        </div>
      </template>
    </Form>
  </div>
</template>

<style scoped lang='scss'></style>
