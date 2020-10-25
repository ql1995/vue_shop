<template>
<div>
  <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <el-row  :gutter="12">
        <el-col :span="8">
            <el-input placeholder="请输入内容" clearable @clear="getUserList" v-model="queryInfo.query"  class="input-with-select">
              <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
            </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
    <!-- 用户列表区域 -->
      <el-table border stripe :data="userList" style="width: 100%">
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column prop="username" label="姓名" ></el-table-column>
        <el-table-column prop="email" label="邮箱" ></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色" ></el-table-column>
        <el-table-column  label="状态" >
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column  label="操作" width="180">
          <template slot-scope="scope">
               <!-- 修改用户 -->
              <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)"></el-button>
              <!-- 删除用户 -->
              <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteUserById(scope.row.id)"></el-button>
              <!-- 分配权限 -->
              <el-tooltip  effect="dark" content="分配角色" placement="top" :enterable="false">
                <el-button size="mini" type="warning" icon="el-icon-setting" @click="setRoles(scope.row)"></el-button>
              </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
     
       <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" @close="addDialogClose"  :visible.sync="addDialogVisible"  width="50%">
      <!-- 主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话号码" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" @close='editDialogClose' :visible.sync="editDialogVisible" width="50%">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="用户名">
          <el-input disabled v-model="editForm.username"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话号码" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog  title="分配角色" :visible.sync="setRolesDialogVisible"
      @close='setRolesDialogVisibleClosed' width="50%">
      <div>
        <p>当前的用户:{{userInfo.username}}</p>
        <p>当前的角色:{{userInfo.role_name}}</p>
        <p>分配新角色: 
          <el-select v-model="selectRoleId" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
  <span slot="footer" class="dialog-footer">
    <el-button @click="setRolesDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
  </span>
</el-dialog>

</div>
</template>
<script type="text/ecmascript-6">
import { async } from 'q'
export default {
  data(){
     // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }

      cb(new Error('请输入合法的邮箱'))
    }

    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
        return cb()
      }

      cb(new Error('请输入合法的手机号'))
    }
    return{
      queryInfo:{
        query:'',
        pagenum:1,
        pagesize:2
      },
      userList:[],
      total:0,
      addDialogVisible:false,
      addForm:{
        username:'',
        password:'',
        email:'',
        mobile:''
      },
      addFormRules:{
          username:[
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 5, max: 10, message: '长度在 5 到 10 个字符', trigger: 'blur' }
          ],
          password:[
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
          ],
          email:[
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            { validator:checkEmail,trigger:'blur'}
          ],
          mobile:[
            { required: true, message: '请输入电话号码', trigger: 'blur' },
            { validator:checkMobile, trigger:'blur'}
          ]
      },
      editDialogVisible:false,
      editForm:{},
      editFormRules:{
        email:[
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            { validator:checkEmail,trigger:'blur'}
          ],
        mobile:[
          { required: true, message: '请输入电话号码', trigger: 'blur' },
          { validator:checkMobile, trigger:'blur'}
        ]
      },
      setRolesDialogVisible:false,
      userInfo:{},
      roleList:[],
      selectRoleId:''
    }
  },
  created(){
    this.getUserList();
  },
  methods:{
    async getUserList(){
      const{data:res}= await this.$http.get('/users',{ params:this.queryInfo })
      if(!res.meta.status==200) return this.$message.error(res.meta.msg)
        this.userList=res.data.users
        this.total=res.data.total
        this.$message.success(res.meta.msg)
    },
      // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize=newSize;
      this.getUserList();
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage){
      this.queryInfo.pagenum=newPage
      this.getUserList();
    },
    async userStateChanged(userInfo){
      // console.log(userInfo);
      const {data:res}=await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`);
      if(res.meta.status!==200){
        userInfo.mg_state=!userInfo.mg_state;
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
    },
    addDialogClose(){
      this.$refs.addFormRef.resetFields();
    },
    addUser(){
      this.$refs.addFormRef.validate(async valid=>{
       if(!valid) return
       //发起添加用户的请求
      const{data:res}=await this.$http.post('/users',this.addForm)
      if(res.meta.status!==201) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      //关闭添加用户对话框
      this.addDialogVisible=false
      //重新刷新列表
      this.getUserList();
      })
    },
    async showEditDialog(id){
      this.editDialogVisible=true;
      const {data:res} =await this.$http.get(`/users/${id}`);
      if(res.meta.status!==200){
        return this.$message.error(res.meta.msg)
      }
      this.editForm=res.data;
      this.$message.success(res.meta.msg)
    },
    editDialogClose(){
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息提交
    editUserInfo(){
      this.$refs.editFormRef.validate(async valid=>{
        if(!valid) return
        const{data:res} = await this.$http.put('users/'+this.editForm.id,{
          email:this.editForm.email,
          mobile:this.editForm.mobile
        })
        if(res.meta.status!==200){
          this.$message.error(res.meta.msg)
        }
        this.editDialogVisible=false;
        this.getUserList()
        this.$message.success(res.meta.msg)
      })
    },
    // 根据id删除用户
    async deleteUserById(id){
      const confirmResult =await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>{return err});
        //点击了取消
       if(confirmResult!=='confirm'){
          return this.$message.info("用户已取消了删除")
       }
       //点击了确定 发送删除请求
       const {data:res}= await this.$http.delete('/users/'+id);
       if(res.meta.status!==200){
         return this.$message.error("删除用户失败");
       }
        this.$message.success(res.meta.msg)
        this.getUserList()
    },
    //打开分配角色对话框
    async setRoles(userInfo){
      this.userInfo=userInfo
     //获取角色列表
      const{data:res} =await this.$http.get('/roles');
      if(res.meta.status!==200){
        this.$message.error('获取角色列表失败！')
      }
      //角色列表
      this.roleList=res.data
      this.setRolesDialogVisible=true
    },
    async saveRoleInfo(){
      if(!this.selectRoleId){
        return this.$message.error('请重新分配角色')
      }
      const{data:res}=await this.$http.put(`/users/${this.userInfo.id}/role`,{
        rid:this.selectRoleId
      });
      if(res.meta.status!==200){
        this.$message.success('分配角色失败')
      }
      this.$message.success("分配角色成功")
      this.getUserList()
      this.setRolesDialogVisible=false
    },
    setRolesDialogVisibleClosed(){
      this.selectRoleId='',
      this.userInfo={}
    }
  },
  
}
</script>


<style scoped lang="less" rel="stylesheet/less">

</style>
