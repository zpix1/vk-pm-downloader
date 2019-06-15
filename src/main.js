import Vue from 'vue'
import App from './App.vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

Vue.use(Vuetify, {
  iconfont: 'md' // 'md' || 'mdi' || 'fa' || 'fa4'
})

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
