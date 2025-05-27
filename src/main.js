import { createApp } from 'vue'
import App from '@/App.vue' // <== MainView가 아니라 App.vue를 루트로
import router from '@/router'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { createPinia } from 'pinia'
import { useKakao } from 'vue3-kakao-maps/@utils'
import 'vuetify/dist/vuetify.min.css'

import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light', // 라이트 테마 사용
  },
})

import axios from 'axios'
axios.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

useKakao(import.meta.env.VITE_APP_KAKAO_KEY, ['clusterer', 'services', 'drawing'])
app.use(router).use(vuetify).use(pinia).mount('#app')
