'use strict';

import fs from 'fs';
import path from 'path';
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
export default () => {
  return readAPIKeyFromEnvironment()
    .then(apiKey => evrythng.setup({ apiKey }))
    .then(() => Promise.all([getMeta(), getStats()]))
    .then(upload)
    .catch(err => JSON.stringify(err))
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
function getStats() {
  return new Promise((resolve, reject) => {
    fs.stat(taskConfig.file, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats);
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
  return new Promise((res, rej) => {
    let req = request.put({
      url: meta.uploadUrl,
      headers: {
        'x-amz-acl': 'public-read',
        'Content-Type': meta.type,
        'Content-Length': stats.size
      }
    });

    let readStream = fs.createReadStream(taskConfig.file);

    req.on('response', res);
    req.on('error', rej);

    readStream.on('error', rej);
    readStream.pipe(req);
  });
}


/**
 * Tries to read API key from environment variable.
 *
 * @returns {Promise}
 */
function readAPIKeyFromEnvironment() {
  return Promise.resolve(process.env['EVT_AUTH']);
}
