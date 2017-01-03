'use strict';

import path from 'path';
import yargs from 'yargs';
import gulp from 'gulp';
import rename from 'gulp-rename';
import template from 'gulp-template';

import config from './config';

export default (type) => {
  const name = yargs.argv.name;
  const parentPath = yargs.argv.parent || '';
  const destPath = path.join(root, type + 's', parentPath, name);

  return gulp.src(config.paths.blankTemplates(type))
    .pipe(
      template({
        name: name,
        upCaseName: cap(name)
      })
    )
    .pipe(
      rename(path => {
        path.basename = path.basename.replace('temp', name);
      })
    )
    .pipe(gulp.dest(destPath));
};

/**
 * Simplest "capitalisator", snake-case to CamelCase converter.
 * @param {string} str
 * @returns {string}
 */
function cap(str) {
  return str.split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}


