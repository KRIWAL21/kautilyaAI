import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import {createPinia} from 'pinia'
import { useColorMode } from "@vueuse/core"

const app = createApp(App)
app.use(router)
app.use(createPinia())

useColorMode({
  attribute: "class",
  modes: {
    light: "light",
    dark: "dark",
  },
  initialValue: "dark",
})

app.mount('#app')
