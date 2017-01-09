'use strict';

import path from 'path';

const root = 'src';
const cwd = process.cwd();

/**
 * Holds all configuration required for build pipeline.
 */
export default {

  /**
   * Name of the output bundle
   */
  name: 'components',

  /**
   * Storing project related paths
   */
  paths: {

    /**
     * Root path of all sources
     */
    root: root,

    /**
     * All javascript sources, exluding tests
     */
    js: resolveToRoot('**/*!(.spec.js).js'),

    /**
     * Stylesheet sources
     */
    scss: resolveToRoot('**/*.scss'),

    /**
     * Entry application point. The place where it start running.
     */
    entry: resolveToRoot('index.js'),

    /**
     * Returns path to a given subset of templates by its type.
     */
    templates: type => path.join(cwd, 'templates', type + '/**/*.**')
  }
};

/**
 * Makes given glob relative to sources root
 *
 * @private
 * @param {String} glob
 * @returns {string|*}
 */
function resolveToRoot(glob = '') {
  return path.join(cwd, root, glob); // src/{glob}
}
