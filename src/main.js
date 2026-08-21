import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Element Plus 모듈과 기본 CSS 를 함께 불러온다 (교재 p.236)
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import ko from 'element-plus/es/locale/lang/ko'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: ko })

app.mount('#app')
