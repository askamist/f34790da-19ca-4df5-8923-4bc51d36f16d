import {createApp} from 'vue'
import App from './App.vue'
import { Modal, Table, Datetimepicker } from 'buefy'

import 'buefy/dist/buefy.css'

const app = createApp(App)
app.use(Table)
app.use(Modal)
app.use(Datetimepicker)
app.mount('#app')
