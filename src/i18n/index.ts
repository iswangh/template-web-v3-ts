import { createI18n } from 'vue-i18n'
import { defaultLocale } from '@/config/i18n'
import enUS from '@/locales/en-US'
import zhCN from '@/locales/zh-CN'

const messages = {
  'en-US': enUS,
  'zh-CN': zhCN,
}

export function createAppI18n() {
  return createI18n({
    legacy: false,
    locale: defaultLocale,
    fallbackLocale: defaultLocale,
    messages,
    missingWarn: import.meta.env.DEV,
    fallbackWarn: import.meta.env.DEV,
  })
}
