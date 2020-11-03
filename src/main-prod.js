import Vue from 'vue'
import App from './App.vue'
import router from './router.js'
// import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标库样式文件
import './assets/fonts/iconfont.css'
// 导入可以实现将数据渲染成树形表格的运行依赖
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器的组件
import VueQuillEditor from 'vue-quill-editor'

// 导入进度条插件
import NProgress from 'nprogress'

// 导入axios
import axios from 'axios'
// 全局配置axios的请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 配置请求拦截器将token令牌放在请求头中
axios.interceptors.request.use(config => {
  // console.log(config)
  // 在请求拦截器中调用NProgress.start()开启进度条
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 在响应拦截器中关闭进度条
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})
// 把axios放在Vue的原型上
Vue.prototype.$http = axios
// 把TreeTable这个组件注册为Vue全局组件
Vue.component('tree-table', TreeTable)
// 把富文本编辑器组件注册为全局可用的组件
Vue.use(VueQuillEditor)
// 全局注册一个更改时间格式的过滤器
Vue.filter('dateFormat', (val) => {
  const dateTime = new Date(val)
  // 年
  const y = dateTime.getFullYear()
  // 月
  const M = (dateTime.getMonth() + 1 + '').padStart(2, '0')
  // 日
  const d = (dateTime.getDate() + '').padStart(2, '0')
  // 时
  const h = (dateTime.getHours() + '').padStart(2, '0')
  // 分
  const m = (dateTime.getMinutes() + '').padStart(2, '0')
  // 秒
  const s = (dateTime.getSeconds() + '').padStart(2, '0')
  return `${y}-${M}-${d} ${h}:${m}:${s}`
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
