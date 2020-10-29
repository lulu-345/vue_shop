import Vue from 'vue'
import VueRouter from 'vue-router'
// 导入登录路由子组件
import Login from './components/Login.vue'
// 导入后台管理页面Home路由子组件
import Home from './components/Home.vue'
// 导入Hoem组件的Welcome子组件
import Welcome from './components/Welcome.vue'
// 导入User子组件
import Users from './components/user/Users.vue'
// 导入权限列表单文件组件
import Rights from './components/power/Rights.vue'
// 导入角色列表单文件组件
import Roles from './components/power/Roles.vue'
// 导入商品分类单文件组件
import Cate from './components/goods/Cate.vue'
Vue.use(VueRouter)

const routes = [
  // 配置登录子组件的路由规则
  { path: '/login', component: Login },
  // 当用户访问/的时候直接就重定向到登录路由子组件
  { path: '/', redirect: '/login' },
  // 配置后台管理Home子组件的路由规则
  {
    path: '/home',
    component: Home,
    // 访问/home 的时候重定向到/welcome
    redirect: '/welcome',
    children:
      [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/Rights', component: Rights },
        { path: '/Roles', component: Roles },
        { path: '/categories', component: Cate }
      ]
  }
]

const router = new VueRouter({
  routes
})
// 路由导航守卫控制访问权限
router.beforeEach((to, from, next) => {
  // 如果用户访问的是登录页面就放行
  if (to.path === '/login') return next()
  // 拿到用户存储在sessionStorage中的token值
  const tokenStr = window.sessionStorage.getItem('token')
  // 如果tokenStr不存在 就强制跳转到登录页面
  if (!tokenStr) return next('/login')
  // 否则就是有令牌，给予放行
  next()
})

export default router
