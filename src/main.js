import '@/style/reset.css'
import '@/style/helper.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { OhVueIcon, addIcons } from "oh-vue-icons"
import { GiCaveman, GiDeerHead, GiBrickWall, BiTreeFill } from "oh-vue-icons/icons"

addIcons(GiCaveman, GiDeerHead, GiBrickWall, BiTreeFill)

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.component("v-icon", OhVueIcon);

app.mount('#app')
