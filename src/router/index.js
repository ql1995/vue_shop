import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/components/Login'
import Home from '@/components/Home'
Vue.use(VueRouter)
const router = new VueRouter({
  routes:[
    {
      path:'/',
      redirect:'/login'
    },
    {
      path:'/login',
      component:Login
    },
    {
      path:'/home',
      component:Home
    },
  ]
})
//登录导航守卫
router.beforeEach((to,from,next)=>{
  //next()放行
  if(to.path==='/login') return next()
  const tokenStr=sessionStorage.getItem('token')
  if(!tokenStr) return next('/login')
  return next()
})

export default router
