import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'primeicons/primeicons.css'
import "./assets/main.css"
import Vue3Marquee from 'vue3-marquee'
import VueApexCharts from "vue3-apexcharts";
import Vue3Toastify from "vue3-toastify";
import "vue3-toastify/dist/index.css";

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Vue3Marquee)
app.use(VueApexCharts);
app.use(Vue3Toastify, {
  autoClose: 3000,
});

app.mount('#app')
