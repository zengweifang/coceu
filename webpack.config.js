const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');

module.exports = function(webpackConfig, _) {
  // 对roadhog默认配置进行操作，比如：
  if (process.env.NODE_ENV === 'production') {
    webpackConfig.plugins.splice(
      3,
      1,
      new ParallelUglifyPlugin({
        cacheDir: '.cache/',
        uglifyJS: {
          output: {
            comments: false
          },
          compress: {
            warnings: false
          }
        }
      })
    );
  }
  return webpackConfig;
};
