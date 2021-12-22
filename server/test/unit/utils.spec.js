/* eslint-disable no-undef */
const { expect } = require('chai');

const { logger } = require('../../utils/logger');
const sleep = require('../../utils/sleep');
const date = require('../../utils/date');
const { publicEncrypt, privateDecrypt } = require('../../utils/encrypt');

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

describe('加密测试', () => {
  it('encrypt', () => {
    const encrpyt = publicEncrypt(JSON.stringify({ type: 'init', data: { name: 'gypsophlia', avatar: 'https://img2.baidu.com/it/u=3183763440,2192017876&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500', account: 100 }, script: 'test' }));

    const decrpyt = privateDecrypt(encrpyt);
    console.log(decrpyt);
    expect(decrpyt).to.be.equal(JSON.stringify({ type: 'init', data: { name: 'gypsophlia', avatar: 'https://img2.baidu.com/it/u=3183763440,2192017876&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500', account: 100 }, script: 'test' }));
  });
});
