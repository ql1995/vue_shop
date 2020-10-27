<template>
<div>
  <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加角色 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
           
            <el-row :class="['bdbottom',i1===0?'bdtop':'','vcenter']" v-for="(item,i1) in scope.row.children" :key="item.id">
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag @close="removeRightsById(scope.row,item.id)" closable>{{item.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <!-- 二级权限 -->
                <el-row :class="[i2!==0?'bdtop':'','vcenter']" v-for="(item2,i2) in item.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" @close="removeRightsById(scope.row,item2.id)" closable>{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag @close="removeRightsById(scope.row,item3.id)" closable v-for="(item3) in item2.children" :key="item3.id" type="warning">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
              
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column  label="角色名称" prop="roleName"></el-table-column>
        <el-table-column  label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column  label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRights(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
   <!-- 分配权限对话框 -->
   <el-dialog title="分配权限" @close="setRightsDialogVisibleClosed" :visible.sync="RightsDialogVisible" width="50%">
    <!-- 树形控件 -->
    <el-tree show-checkbox default-expand-all node-key='id' :data="rightsArr" :props="rightsProps"
    :default-checked-keys="defKeys" ref="treeRef" ></el-tree>
    <span slot="footer" class="dialog-footer">
      <el-button @click="RightsDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="distrRights">确 定</el-button>
  </span>
</el-dialog>
</div>
</template>
<script type="text/ecmascript-6">
export default {
  data(){
    return{
      rolesList:[],
      RightsDialogVisible:false,
      rightsArr:[],
      rightsProps:{
        children:'children',
        label:'authName'
      },
      //默认选中
      defKeys:[],
      //单行角色id
      roleId:''
    }
  },
  created(){
    this.getRolesList();
  },
  methods:{
    async getRolesList(){
      const{data:res}=await this.$http.get('/roles');
      if(res.meta.status!==200){
        return this.$message.error(res.meta.msg)
      }
      this.rolesList=res.data
    },
    async removeRightsById(role,id){
      const confirmResult =await this.$confirm('此操作将永久移除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch((err)=>err)
        if(confirmResult!=='confirm'){
          return this.$message.info('用户取消了删除!')
        }
        //根据id删除权限
      const{data:res} =await this.$http.delete(`/roles/${role.id}/rights/${id}`)
        if(res.meta.status!==200){
          return this.$message.error('删除失败！')
        }
        //重新赋值 增加用户体验
        role.children=res.data
    },
    async setRights(role){
      this.roleId=role.id
      //查询树状权限
      const{data:res}=await this.$http.get('rights/tree');
      if(res.meta.status!==200){
        return this.$message.error(res.meta.msg)
      }
      this.rightsArr=res.data
      //递归获取三级节点
      this.getdefKeys(role,this.defKeys)
      this.RightsDialogVisible=true
      
      
    },
    getdefKeys(node,arr){
      if(!node.children){
      return  arr.push(node.id)
      } 
      //递归
      node.children.forEach(item => this.getdefKeys(item, arr))
    },
    setRightsDialogVisibleClosed(){
      this.defKeys=[]
    },
    // 分配权限的确认按钮
    async distrRights(){
      //所有具有权限的id数组
      const arr=[
        ...this.$refs.treeRef.getCheckedKeys(),...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      const idarr= arr.join(',');
      //发起请求
      const {data:res} =await this.$http.post(`/roles/${this.roleId}/rights`,{
        rids:idarr
      })
      if(res.meta.status!==200){
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功！')
      this.getRolesList()
      this.RightsDialogVisible=false
    }
  }
}
</script>


<style scoped lang="less" rel="stylesheet/less">
.el-tag{
  margin: 7px;
}
.bdtop{
   border-top: 1px solid #eee
}
.bdbottom{
  border-bottom: 1px solid #eee
}
.vcenter{
  display: flex;
  align-items: center;
}
</style>
