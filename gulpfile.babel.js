'use strict';

import gulp     from 'gulp';
import webpack  from 'webpack';
import path     from 'path';
import rename   from 'gulp-rename';
import template from 'gulp-template';
import yargs    from 'yargs';
import gutil    from 'gulp-util';
import serve    from 'browser-sync';
import webpackDevMiddelware from 'webpack-dev-middleware';
import webpackHotMiddelware from 'webpack-hot-middleware';
import colorsSupported      from 'supports-color';

let root = 'src';

// helper method for resolving paths
let resolveToSrc = (glob = '') => {
  return path.join(root, glob); // src/{glob}
};

// Copy blank templates from generator to root
let copyTemplate = (type) => {
  const cap = (str) => {
    return str.split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  };
  const name = yargs.argv.name;
  const parentPath = yargs.argv.parent || '';
  const destPath = path.join(root, type + 's', parentPath, name);

  return gulp.src(paths.blankTemplates(type))
    .pipe(template({
      name: name,
      upCaseName: cap(name)
    }))
    .pipe(rename((path) => {
      path.basename = path.basename.replace('temp', name);
    }))
    .pipe(gulp.dest(destPath));
};

// map of all paths
let paths = {
  js: resolveToSrc('**/*!(.spec.js).js'), // exclude spec files
  scss: resolveToSrc('**/*.scss'), // stylesheets
  entry: path.join(__dirname, root, 'index.js'),
  blankTemplates: (type) => path.join(__dirname, 'generator', type + '/**/*.**')
};

// use webpack.config.js to build modules
gulp.task('webpack', (cb) => {
  const config = require('./webpack.dist.config');
  config.entry.components = paths.entry;

  webpack(config, (err, stats) => {
    if(err)  {
      throw new gutil.PluginError("webpack", err);
    }

    gutil.log("[webpack]", stats.toString({
      colors: colorsSupported,
      chunks: false,
      errorDetails: true
    }));

    cb();
  });
});

gulp.task('build', ['webpack']);

gulp.task('serve', () => {
  var config = require('./webpack.config');
  config.entry.components = paths.entry;

  var compiler = webpack(config);

  serve({
    port: process.env.PORT || 3000,
    open: false,
    server: {baseDir: root},
    https: true,
    middleware: [
      webpackDevMiddelware(compiler, {
        stats: {
          colors: colorsSupported,
          chunks: false,
          modules: false
        },
        publicPath: config.output.publicPath
      }),
      webpackHotMiddelware(compiler)
    ]
  });
});

gulp.task('component', () => copyTemplate('component'));

gulp.task('service', () => copyTemplate('service'));

gulp.task('default', ['serve']);
