<script setup lang='ts'>
import type { FormItem } from '@iswangh/element-plus-kit'
import type { FormRules } from 'element-plus'
import type { UserInfo } from '@/types'

const formItems: FormItem[] = [
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

const { form } = useForm<UserInfo>({})
</script>

<template>
  <div class="p-20px bg-white h-screen">
    <WForm :model="form" :form-items="formItems" :rules label-width="70" :action-config="{ vIf: true, buttons: ['submit', 'cancel'] }" @action="console.log($event)" @focus="console.log('focus', $event)" @blur="console.log('blur', $event)" />
  </div>
</template>

<style scoped lang='scss'></style>
