import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/components/Login'
import Home from '@/components/Home'
import Welcome from '@/components/Welcome'
import Users from '@/components/user/Users'
import Rights from '@/components/power/Rights'
import Roles from '@/components/power/Roles'
import Categories from '@/components/goods/Categories'
import Params from '@/components/goods/Params'
import List from '@/components/goods/List'
import Add from '@/components/goods/Add'

import Order from '@/components/order/Order'
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
      component:Home,
      redirect:'/welcome',
      children:[
        {
          path:'/welcome',
          component:Welcome
        },
        {
          path:'users',//相当于/home/users
          path:'/users',//相当于/users
          component:Users
        },
        {
          path:'/rights',
          component:Rights
        },
        {
          path:'/roles',
          component:Roles
        },
        {
          path:'/categories',
          component:Categories
        },
        {
          path:'/params',
          component:Params
        },
        {
          path:'/goods',
          component:List,
        },
        {
          path:'/goods/add',
          component:Add,
        },
        {
          path:'/orders',
          component:Order
        }
      ]
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
