var JavaScriptObfuscator = require('webpack-obfuscator');

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/vk-pm-downloader' : '/',
  chainWebpack: config => {
    config
      .plugin('define')
        .tap(args => {
          let v = JSON.stringify(require('./package.json').version)
          args[0]['process.env']['VERSION'] = v
          return args
        })
  },
  configureWebpack: {
    // plugins: (process.env.NODE_ENV == 'production' ? [ new JavaScriptObfuscator() ] : [])
  }
}