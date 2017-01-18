'use strict';

import fs from 'fs';
import path from 'path';
import gutil from 'gulp-util';
import request from 'request';
import evrythng from 'evrythng-extended';

import webpackDistConfig from '../webpack.dist.config';
import config from './config';

const taskConfig = {
  file: path.join(
    webpackDistConfig.output.path,
    webpackDistConfig.output.filename.replace('[name]', config.name)
  ),
  filesFilter: {
    tags: ['components']
  }
};

/**
 * Deploys the built components to EVRYTHNG Files API.
 *
 * @return {Promise}
 */
export default function deployWidgets() {
  return readAPIKey()
    .then(apiKey => evrythng.setup({ apiKey }))
    .then(getMeta)
    .then(getStats)
    .then(upload)
    .catch(toGulpPluginError);
};

/**
 * Retrieves EVRYTHNG File Metadata from the Files API using filter from taskConfig
 * If no metadata found, creates a new one to be used now and for further publish calls.
 *
 * @return {Promise}
 */
function getMeta() {
  return evrythng.api({
    url: '/files',
    params: {
      filter: taskConfig.filesFilter
    }
  }).then(metas => metas && metas.length ? metas[0] : createMeta());
}

/**
 * Retrieves stats for a file from taskConfig
 *
 * @return {Promise}
 */
function getStats(meta) {
  return new Promise((resolve, reject) => {
    fs.stat(taskConfig.file, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve([ stats, meta ]);
      }
    });
  });
}

/**
 * Creates File entity to store components contents for current and future
 * publish calls.
 *
 * @return {Promise}
 */
function createMeta() {
  return evrythng.api({
    url: '/files',
    method: 'POST',
    data: {
      name: `${config.name}.js`,
      type: 'application/javascript',
      tags: taskConfig.filesFilter.tags,
      privateAccess: false
    }
  });
}

/**
 * Performs actual upload of file from taskConfig to remote storage.
 *
 * @param {Object} meta - EVRYTHNG File entity
 * @param {Object} stats - fs.stats of the file to upload
 * @return {Promise}
 */
function upload([ meta, stats ]) {
  return new Promise((resolve, reject) => {
    let uploadRequest = request.put({
      url: meta.uploadUrl,
      headers: {
        'x-amz-acl': 'public-read',
        'Content-Type': meta.type,
        'Content-Length': stats.size
      }
    });

    const readStream = fs.createReadStream(taskConfig.file);

    uploadRequest.on('response', resolve);
    uploadRequest.on('error', reject);

    readStream.on('error', reject);
    readStream.pipe(uploadRequest);
  });
}


/**
 * Tries to read API key from environment variable.
 *
 * @returns {Promise}
 */
function readAPIKey() {
  const key = process.env['EVT_AUTH'];

  if (key) {
    return Promise.resolve(key);
  } else {
    return Promise.reject(new Error('API key was not found in EVT_AUTH environment variable'));
  }
}

/**
 * Converts generic or evrythng.js errors to PluginErrors
 *
 * @param {Object} error
 * @param {String[]} [error.errors]
 * @param {String} [error.message]
 */
function toGulpPluginError(error) {
  const message = error.errors ? error.errors.join('\n') : error.message;

  throw new gutil.PluginError('deploy-widgets', message, { showStack: true });
}
