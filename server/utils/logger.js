/**
 * logger config
 * @module utils/logger
 */

const log4js = require('log4js');
const path = require('path');

const logPath = path.resolve(path.dirname(__dirname), 'logs', 'server.log');

log4js.configure({
  appenders: {
    Server: {
      type: 'dateFile',
      filename: logPath,
    },
    stdout: {
      type: 'stdout',
    },
  },
  categories: {
    default: {
      appenders: ['Server'],
      level: 'debug',
    },
    console: {
      appenders: ['stdout'],
      level: 'info',
    },
  },
});

/**
 * logger categories [default] to file
 */
const logger = log4js.getLogger();
/**
 * logger categories [console] to stdout
 */
const stdout = log4js.getLogger('console');

module.exports = {
  logger,
  stdout,
};
