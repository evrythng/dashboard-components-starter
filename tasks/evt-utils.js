'use strict';

/**
 * Tries to read API key from environment variable.
 *
 * @returns {Promise}
 */
export function readAPIKeyFromEnvironment() {
  return Promise.resolve(process.env['EVT_AUTH']);
}
