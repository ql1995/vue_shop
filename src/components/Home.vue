
<template>

  <el-container class="home-container">
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button> 
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px':'200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu :default-active='activePath' :unique-opened="true" router 
          :collapse-transition="false" :collapse="isCollapse" 
          background-color="#333744" text-color="#fff" active-text-color="#409EFF">
          <!-- 一级菜单 -->
          <el-submenu :index="menuItem.id+''" v-for="menuItem in MenuArr" :key="menuItem.id">
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[menuItem.id]"></i>
              <!-- 文本 -->
              <span>{{menuItem.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item  :index="'/'+item.path"  @click="saveNavStatus('/'+item.path)" v-for="item in menuItem.children" :key="item.id">
              <!-- 二级菜单的模板区域 -->
              <template slot="title">
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{item.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>


</template>
<script type="text/ecmascript-6">
export default {
  created(){
    this.getMenuList();
    this.activePath=sessionStorage.getItem('activePath')
  },
  data(){
    return{
      //是否折叠
      isCollapse:false,
      MenuArr:[],
      iconsObj:{
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      activePath:''
    }
  },
  methods:{
    logout(){
      sessionStorage.clear();
      this.$router.push('/login')
    },
    async getMenuList(){
      const{data:res}=await this.$http.get('/menus');
      if(!res.meta.status==200) return this.$message.error(res.meta.msg)
      this.MenuArr=res.data
    },
    toggleCollapse(){
      this.isCollapse=!this.isCollapse
    },
    //点击之后才触发
    saveNavStatus(activePath){
      sessionStorage.setItem('activePath',activePath);
      this.activePath=activePath
    }
  }
}
</script>


<style scoped lang="less" rel="stylesheet/less">
.home-container{
  height: 100%;
}
.el-header{
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  color: #fff;
  align-items: center;
  padding-left: 0px;
  font-size: 20px;
  >div{
    display: flex;
    align-items: center;
    span{
      margin-left: 15px;
    }
  }
}
.el-aside{
  background-color: #333744;
  .el-menu{
    border-right: none
  }
}
.el-main{
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 10px
}
.toggle-button{
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  cursor: pointer;
  letter-spacing: 0.2em;
}
</style>
