import { VueQueryPlugin } from '@tanstack/vue-query'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { queryClient } from '@/utils'
import App from './App.vue'
import { setupElementPlus } from './plugins'
import router from './router'
import pinia from './stores'
import 'virtual:uno.css'

pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

setupElementPlus(app)

app.use(pinia)
app.use(router)
app.use(VueQueryPlugin, { queryClient })

app.mount('#app')
