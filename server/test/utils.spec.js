/* eslint-disable no-undef */
const { expect } = require('chai');

const { logger } = require('../utils/logger');
const sleep = require('../utils/sleep');
const date = require('../utils/date');

describe('日志测试', () => {
  // write log
  it('writeLog', () => {
    logger.info('日志写入测试');
  });
});

describe('自定义sleep测试', () => {
  // sleep test
  // interrupt for 500 ms
  it('sleep', async () => {
    await sleep(500, () => {
      console.log('end');
    });
  });
});

describe('日期测试', () => {
  it('getDate', () => {
    expect(date.getDate()).to.be.include('2021-12');
  });
  it('getTime', () => {
    console.log(date.getTime());
    expect(date.getTime()).to.be.include(':');
  });
});
