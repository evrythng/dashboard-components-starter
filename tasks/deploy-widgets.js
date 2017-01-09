'use strict';

import fs from 'fs';
import path from 'path';
import request from 'request';
import evrythng from 'evrythng-extended';

import webpackConfig from '../webpack.config';
import getApiKey from './get-api-key';
import projectConfig from './config';

const config = {
  file: path.join(
    webpackConfig.output.path,
    webpackConfig.output.filename.replace('[name]', projectConfig.name)
  ),
  filesFilter: {
    tags: ['components']
  }
};

////////////////////////////////////////////

export default () => {
  return getApiKey()
    .then(apiKey => evrythng.setup({ apiKey }))
    .then(() => Promise.all([getMeta(), getStats()]))
    .then(upload)
    .then(err => JSON.stringify(err))
};

function getMeta() {
  return evrythng.api({
    url: '/files',
    params: {
      filter: config.filesFilter
    }
  }).then(metas => metas && metas.length ? metas[0] : createMeta());
}

function getStats() {
  return new Promise((res, rej) => {
    fs.stat(config.file, (err, stats) => {
      if (err) {
        rej(err);
      } else {
        res(stats);
      }
    });
  });
}

function createMeta() {
  return evrythng.api({
    url: '/files',
    method: 'POST',
    data: {
      name: `${projectConfig.name}.js`,
      type: 'application/javascript',
      tags: config.filesFilter.tags,
      privateAccess: false
    }
  });
}

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

    let readStream = fs.createReadStream(config.file);

    req.on('response', res);
    req.on('error', rej);

    readStream.on('error', rej);
    readStream.pipe(req);
  });
}
