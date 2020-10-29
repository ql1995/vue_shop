<template>
<div>
  <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 --> 
    <el-card>
      <!-- 为 ECharts 准备一个具备大小（宽高）的 DOM -->
    <div id="main" style="width: 750px;height:400px;"></div>
    </el-card>
</div>

</template>
<script type="text/ecmascript-6">
import echarts from 'echarts'
import _ from 'lodash'
export default {
  data(){
    return{
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  async mounted(){
    // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(document.getElementById('main'));

        // 指定图表的配置项和数据
       const{data:res}= await this.$http.get(`reports/type/1`);
       if(res.meta.status!==200){
         this.$message.error('获取数据失败')
        }
        console.log(res.data)
      const result=_.merge(res.data,this.options)
        // 使用刚指定的配置项和数据显示图表。
        console.log('=====')
        console.log(result)
        // myChart.setOption(option);
        myChart.setOption(result)
  }
}
</script>


<style scoped lang="less" rel="stylesheet/less">

</style>
