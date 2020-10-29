import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import "./assets/css/global.css"
import "@/assets/fonts/iconfont.css"
import TreeTable from 'vue-table-with-tree-grid'
import axios from 'axios'
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
axios.defaults.baseURL='http://127.0.0.1:8888/api/private/v1/'

//添加请求拦截器
axios.interceptors.request.use(config=>{
  NProgress.start()
  config.headers.Authorization=sessionStorage.getItem('token');
  return config
})
// 添加响应拦截器
axios.interceptors.response.use(config=>{
  NProgress.done()
  return config
})
//添加过滤器
Vue.filter('dateFormat', function(originVal) {
  const dt = new Date(originVal)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
Vue.prototype.$http=axios
Vue.config.productionTip = false
Vue.component('tree-table',TreeTable)
Vue.use(VueQuillEditor, /* { default global options } */)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
