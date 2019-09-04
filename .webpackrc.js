const path = require('path');

export default {
  entry: 'src/index.js',
  outputPath: path.resolve(__dirname, 'html'),
  extraBabelPlugins: [
    ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }],
    'lodash'
  ],
  env: {
    development: {
      extraBabelPlugins: ['dva-hmr']
    }
  },
  alias: {
    assets: path.resolve(__dirname, 'src/assets/'),
    components: path.resolve(__dirname, 'src/components/'),
    languages: path.resolve(__dirname, 'src/languages/'),
    models: path.resolve(__dirname, 'src/models/'),
    routes: path.resolve(__dirname, 'src/routes/'),
    utils: path.resolve(__dirname, 'src/utils/')
  },
  ignoreMomentLocale: true,
  theme: './src/theme.js',
  html: {
    template: './src/index.ejs'
  },
  lessLoaderOptions: {
    javascriptEnabled: true
  },
  disableDynamicImport: false,
  publicPath: '/',
  hash: true,
  proxy: {
    '/biao': {
      target: 'http://www.coceu.com',
      changeOrigin: true,
      ws: true
    },
    '/userfiles': {
      target: 'http://www.ecoexc.com',
      changeOrigin: true
    },
    // '/biao/index/kline': {
    //   target: 'http://10.10.10.2:8089',
    //   changeOrigin: true
    // },
    // '/biao': {
    //   target: 'http://192.168.1.102:8083',
    //   changeOrigin: true
    // },
    '/card/upload': {
      target: 'http://images.coceu.com',
      changeOrigin: true
    },
    // '/biao/websocket': {
    //   target: 'http://10.10.10.4:9999',
    //   changeOrigin: true,
    //   ws: true
    // },
    // '/biao/im': {
    //   target: 'http://10.10.10.3:6666',
    //   changeOrigin: true,
    //   ws: true
    // }
  }
};
