'use strict';

import gulp from 'gulp';
import gutil from 'gulp-util';
import webpack  from 'webpack';
import webpackDevMiddelware from 'webpack-dev-middleware';
import webpackHotMiddelware from 'webpack-hot-middleware';
import serve from 'browser-sync';
import colorsSupported from 'supports-color';

import config from './tasks/config';
import copyTemplate from './tasks/copy-template';
import deployWidgets from './tasks/deploy-widgets';

import webpackDistConfig from './webpack.dist.config';
import webpackConfig from './webpack.config';

/**
 * Bundles application modules with webpack
 */
gulp.task('webpack', done => {
  webpackConfig.entry[config.name] = config.paths.entry;

  webpack(webpackConfig, (err, stats) => {
    if(err)  {
      throw new gutil.PluginError("webpack", err);
    }

    gutil.log("[webpack]", stats.toString({
      colors: colorsSupported,
      chunks: false,
      errorDetails: true
    }));

    done();
  });
});

/**
 * Starts webpack dev server
 */
gulp.task('serve', () => {
  let compiler;

  webpackDistConfig.entry.components = config.paths.entry;
  compiler = webpack(webpackDistConfig);

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
        publicPath: webpackDistConfig.output.publicPath
      }),
      webpackHotMiddelware(compiler)
    ]
  });
});

/**
 * Deploys new component template
 */
gulp.task('component', () => copyTemplate('component'));

/**
 * Deploys new service template
 */
gulp.task('service', () => copyTemplate('service'));

/**
 * Uploads the built widgets to a EVRYTHNG File entity.
 */
gulp.task('publish', ['build'], () => deployWidgets());

gulp.task('build', ['webpack']);
gulp.task('default', ['serve']);
