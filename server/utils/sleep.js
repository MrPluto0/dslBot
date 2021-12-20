/* eslint-disable no-unused-expressions */
/**
 * @module utils/sleep
 */

/**
 * sleep: block the process
 * @param {Number} time
 * @param {Function} callback
 */
module.exports = function sleep(time, callback) {
  return new Promise((resolve) => {
    setTimeout(() => {
      callback && callback();
      resolve();
    }, time);
  });
};
