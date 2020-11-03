module.exports = {
  chainWebpack: config => {
    // 如果是开发模式的情况下设置打包的入口文件为src目录下面的main-dev.js
    config.when(process.env.NODE_ENV === 'development', config => {
      config.entry('app').clear().add('./src/main-dev.js')
      // 在开发模式下面
      config.plugin('html').tap(args => {
        args[0].isProd = false
        return args
      })
    })
    // 如果是生产模式的情况下设置打包的入口文件为src目录下面的main-prod.js
    config.when(process.env.NODE_ENV === 'production', config => {
      config.entry('app').clear().add('./src/main-prod.js')
      // 在生产模式下面通过externals字段来加载外部的CDN资源
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor'
      })
      // 在生产模式下面
      config.plugin('html').tap(args => {
        args[0].isProd = true
        return args
      })
    })
  }
}
