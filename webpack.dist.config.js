import webpack from 'webpack';
import config from './webpack.config';

config.plugins = config.plugins.concat([

  // Reduces bundles total size
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      // https://github.com/webpack/style-loader/issues/62
      // Drops warnings when cutting *unused* declarations or
      // *unreachable* code
      warnings: false
    },
    mangle: {

      // You can specify all variables that should not be mangled.
      // For example if your vendor dependency doesn't use modules
      // and relies on global variables. Most of angular modules relies on
      // angular global variable, so we should keep it unchanged
      except: ['$super', '$', 'exports', 'require', 'angular']
    }
  })

]);

export default config;
