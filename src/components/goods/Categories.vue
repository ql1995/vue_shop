<template>
<div>
  <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
        <!-- 添加分类 -->
        <el-row>
          <el-col>
            <el-button type="primary" @click="showAddCategoryDialog">添加分类</el-button>
          </el-col>
        </el-row>
        <!-- 表格区域 -->
        <tree-table class="treeTable" :data='cateArr' :columns="columns" :selection-type="false" :expand-type="false"
          show-index index-text="#" border :show-row-hover="false" children-prop="children">
          <!-- 是否删除 -->
          <template slot="isok" slot-scope="scope">
            <i v-if="scope.row.cat_deleted===false" class="el-icon-success" style="color:lightgreen"></i>
            <i v-else class="el-icon-error" style="color:red"></i>
          </template>
          <!-- 排序 -->
          <template slot="order" slot-scope="scope">
            <el-tag v-if="scope.row.cat_level===0">一级</el-tag>
            <el-tag v-else-if="scope.row.cat_level===1" type="success">二级</el-tag>
            <el-tag v-else type="warning">三级</el-tag>
          </template>
          <!-- 操作 -->
          <template slot="operation">
          <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
          </template>
        </tree-table>
        <!-- 页码 -->
        <el-pagination @size-change="handleSizeChange"  @current-change="handleCurrentChange"
        :current-page="queryInfo.ppagenum" :page-sizes="[1, 3, 5, 7]"
        :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper"
        :total="total">
        </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog @close="addCategoryDialogClose"
      title="添加分类" :visible.sync="addCategoryDialogVisible" width="50%" >
      <el-form :model="addCategoryForm" :rules="addCategoryFormRules" ref="addCategoryFormRef" label-width="100px" class="demo-ruleForm">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCategoryForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
         <!-- 级联选择器  选中项绑定值 配置选项props
          可选项数据源options
         v-model-->
          <el-cascader v-model="selectedKeys" clearable 
            :options="optCateArr" change-on-select
            :props="parentCascadProps"
            @change="handleChange">
          </el-cascader>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
      <el-button @click="addCategoryDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
</div>
</template>
<script type="text/ecmascript-6">
import { async } from 'q';
export default {
  data(){
    return{
        queryInfo:{
          type:3,
          pagenum:1,
          pagesize:5
        },
        //分类数组
        cateArr:[],
        //总的条数
        total:0,
        //为各列定义属性
        columns:[
          {
          label:'分类名称',
          prop:'cat_name'
          },
          {
            label:'是否有效',
            prop:'cat_deleted',
            type:'template',
            template:'isok'
          },
          // 排序
          {
            label:'排序',
            prop:'cat_level',
            type:'template',
            template:'order'
          },
          //操作
          {
            label:'排序',
            type:'template',
            template:'operation'
          }
        ],
        addCategoryDialogVisible:false,
        // 添加分类的请求参数
        addCategoryForm:{
          //默认一级分类
          cat_pid:0,
          //父级分类名称
          cat_name:'',
          //分类层级 默认为一级
          cat_level:0
        },
        //校验规则
        addCategoryFormRules:{
          cat_name:[
            { required: true, message: '请输入分类名称', trigger: 'blur' },
          ]
        },
        optCateArr:[],
        selectedKeys:[],
        parentCascadProps:{
          value: 'cat_id',
          expandTrigger:'hover',
          label:'cat_name',
          children:'children'
        }
      }
  },
  created(){
    this.getCateArr();
  },
  methods:{
    //获取一级分类
    async getCateArr(){
      const{data:res}=await this.$http.get('/categories',{
          params:this.queryInfo
      });
      if(res.meta.status!==200){
        //不向下继续执行
        return  this.$message.error("获取分类失败！")
      }
      this.cateArr=res.data.result
      this.total=res.data.total
    },
    //尺寸发生变化
    handleSizeChange(newSize){
      this.queryInfo.pagesize=newSize
      this.getCateArr()
    },
    //页码发生变化
    handleCurrentChange(newPage){
      this.queryInfo.pagenum=newPage
      this.getCateArr()
    },
    // 添加分类对话框显示
    showAddCategoryDialog(){
      this.getSelecteCateList();
      this.addCategoryDialogVisible=true
    },
    //获取可选择的一二级分类名称
    async getSelecteCateList(){
      const{data:res} = await this.$http.get('/categories',{
        params:{
          type:2
        }
      });
      if(res.meta.status!==200){
        return this.$message.error('获取一二级分类失败')
      }
      //获取成功
      this.optCateArr=res.data
    },
    //级联选择发生改变时触发
    handleChange(){
     if(this.selectedKeys.length>0){
       this.addCategoryForm.cat_pid=this.selectedKeys[this.selectedKeys.length-1];
       this.addCategoryForm.cat_level=this.selectedKeys.length;
        return
     }else{
       this.addCategoryForm.cat_pid=0
       this.addCategoryForm.cat_level=0
     }
    },
    //添加分类
    addCate(){
      this.$refs.addCategoryFormRef.validate(async valid=>{
        if(!valid) return
        //发起添加分类请求
        const{data:res} =await this.$http.post('/categories',this.addCategoryForm);
        if(res.meta.status!==201){
          return this.$message.error('添加分类失败')
        }
        this.$message.success(res.meta.msg)
        this.getCateArr()
        this.addCategoryDialogVisible=false
      })
      console.log(this.addCategoryForm)
    },
    //对话框关闭重置表单
    addCategoryDialogClose(){
      this.$refs.addCategoryFormRef.resetFields()
      this.selectedKeys=[]
      this.addCategoryForm.cat_level=0
      this.addCategoryForm.cat_pid=0
    }
  }
}
</script>


<style scoped lang="less" rel="stylesheet/less">
.treeTable{
  margin-top: 15px //scoped修饰
}
.el-cascader{
  width: 100%
}
// 不生效该单页面组件上没有scoped修饰
.el-scrollbar__wrap{
    height: 300px !important;
  }

</style>
