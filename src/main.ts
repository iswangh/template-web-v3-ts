import { VueQueryPlugin } from '@tanstack/vue-query'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { queryClient } from '@/utils'
import App from './App.vue'
import { setupElementPlus } from './plugins'
import router from './router'
import pinia from './stores'
import 'virtual:uno.css'
// 用于动态渲染 element-plus-kit 的样式
import 'element-plus/dist/index.css'

pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

setupElementPlus(app)

app.use(pinia).use(router).use(VueQueryPlugin, { queryClient })

app.mount('#app')
