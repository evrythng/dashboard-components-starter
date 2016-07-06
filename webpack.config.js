var path    = require('path');

module.exports = {
  devtool: 'sourcemap',
  entry: {},
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
};
