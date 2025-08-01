import {createApp} from 'vue'
import App from './App.vue'
import { Modal, Table } from 'buefy'

import 'buefy/dist/buefy.css'

const app = createApp(App)
app.use(Table)
app.use(Modal)
app.mount('#app')
