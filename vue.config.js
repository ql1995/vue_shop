const path = require('path');
module.exports = {
  // 关闭EsLint的规则
  lintOnSave: false,
  devServer:{
      hot:true,
      open:true
  },
  configureWebpack: { //webpack原生配置
    // 引入模块的解析
    resolve: {
        extensions: ['.js', '.vue', '.json'], // 可以省略的后缀名
        alias: { // 路径别名(简写方式)
            // 'vue$': 'vue/dist/vue.esm.js', // 表示精准匹配   带vue编译器
            '@': path.resolve(__dirname, 'src'),
            '@components': path.resolve(__dirname, 'src/components'),
        }
    }
},
}