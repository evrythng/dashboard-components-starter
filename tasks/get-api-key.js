'use strict';

import fs from 'fs';
import path from 'path';
import expandTilde from 'expand-tilde';

let config = {
  env: 'EVT_AUTH',
  file: '.evt-auth'
};

/////////////////////////////////////////////////////////////////

export {
  getAPIKey as default,

  readEnvironment,
  readFile,
  setup
};

/////////////////////////////////////////////////////////////////

function getAPIKey() {
  return readEnvironment()
    .then(key => {
      if (key) {
        return key;
      } else {
        return readFile();
      }
    });
}

/**
 * Tries to read API key from environment variable.
 *
 * @returns {Promise}
 */
function readEnvironment() {
  return Promise.resolve(process.env[config.env]);
}

/**
 * Tries to read API key from authorisation file
 *
 * @returns {Promise}
 */
function readFile() {
  return new Promise((res, rej) => {
    let authFile = path.join(expandTilde('~'), config.file);

    fs.readFile(authFile, 'utf-8', (err, data) => {
      if (err) {
        rej(err);
      } else {
        res(data);
      }
    });
  });
}

/**
 * Allows to change env variable name or other configuration
 * options from external code.
 *
 * @param {Object} newConfig
 *   @prop {string} env Environment Variable name
 *   @prop {string} file Name of auth file
 */
function setup(newConfig) {
  let key;

  for (key in newConfig) {
    if (newConfig.hasOwnProperty(key) && config[key]) {
      config[key] = newConfig[key];
    }
  }
}
