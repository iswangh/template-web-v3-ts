<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import en from 'element-plus/es/locale/lang/en'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const elementLocale = computed(() => (locale.value.startsWith('en') ? en : zhCn))
</script>

<template>
  <ElConfigProvider :locale="elementLocale">
    <router-view />
  </ElConfigProvider>
</template>

<style lang="scss" scoped></style>
