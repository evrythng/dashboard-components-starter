'use strict';

import gulp from 'gulp';
import gutil from 'gulp-util';
import webpack  from 'webpack';
import webpackDevMiddelware from 'webpack-dev-middleware';
import webpackHotMiddelware from 'webpack-hot-middleware';
import browserSync from 'browser-sync';
import supportsColor from 'supports-color';

import config from './tasks/config';
import copyTemplate from './tasks/copy-template';
import deployWidgets from './tasks/deploy-widgets';

import webpackDistConfig from './webpack.dist.config';
import webpackConfig from './webpack.config';

/**
 * Bundles application modules with webpack
 */
function compile(done) {
  webpack(webpackDistConfig, (err, stats) => {
    if(err)  {
      throw new gutil.PluginError("webpack", err);
    }

    gutil.log("[webpack]", stats.toString({
      colors: supportsColor,
      chunks: false,
      errorDetails: true
    }));

    done();
  });
}

/**
 * Starts webpack dev server
 */
function serve() {
  const compiler = webpack(webpackConfig);

  browserSync({
    port: process.env.PORT || 3000,
    open: false,
    server: { baseDir: config.paths.root },
    https: true,
    middleware: [
      webpackDevMiddelware(compiler, {
        stats: {
          colors: supportsColor,
          chunks: false,
          modules: false
        },
        publicPath: webpackDistConfig.output.publicPath
      }),
      webpackHotMiddelware(compiler)
    ]
  });
}

/**
 * Uploads the built widgets to a EVRYTHNG File entity.
 */
function publish() {
  return gulp.series(compile, deployWidgets)();
}

/**
 * Deploys new component template
 */
function copyComponent() {
  return copyTemplate('component');
}

/**
 * Deploys new service template
 */
function copyService() {
  return copyTemplate('service');
}

gulp.task('default', serve);
gulp.task('serve', serve);

gulp.task('webpack', compile);
gulp.task('build', compile);

gulp.task('publish', publish);

gulp.task('component', copyComponent);
gulp.task('service', copyService);

