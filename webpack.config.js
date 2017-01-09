import path from 'path'
import config from './tasks/config'

export default {
  devtool: 'sourcemap',
  entry: {
    [config.name]: config.paths.entry
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: [/app\/lib/, /node_modules/], loader: 'ng-annotate!babel?presets[]=es2015' },
      { test: /\.html$/, loader: 'raw' },
      { test: /\.scss$/, loader: 'style!css!sass' },
      { test: /\.css$/, loader: 'style!css' }
    ]
  },
  plugins: [],
  externals: ['angular-material', 'lodash', 'moment']
}
