import Vue from 'vue'
import App from './App.vue'
import router from './router.js'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标库样式文件
import './assets/fonts/iconfont.css'
// 导入可以实现将数据渲染成树形表格的运行依赖
import TreeTable from 'vue-table-with-tree-grid'

// 导入axios
import axios from 'axios'
// 全局配置axios的请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 配置请求拦截器将token令牌放在请求头中
axios.interceptors.request.use(config => {
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 把axios放在Vue的原型上
Vue.prototype.$http = axios
// 把TreeTable这个组件注册为Vue全局组件
Vue.component('tree-table', TreeTable)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
