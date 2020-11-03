<<<<<<< HEAD
const prodPlugins = []
=======
// 定义一个用于存放生产模式下面的插件的数组
const prodPlugins = []
// 进行判断如果是生产模式就把插件push进去
>>>>>>> 59cc36a5c89a88b2c8f0a8d3507a114697e7aa5d
if (process.env.NODE_ENV === 'production') {
  prodPlugins.push('transform-remove-console')
}

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
<<<<<<< HEAD
    ...prodPlugins,
    '@babel/plugin-syntax-dynamic-import'
=======
    ...prodPlugins
>>>>>>> 59cc36a5c89a88b2c8f0a8d3507a114697e7aa5d
  ]
}
