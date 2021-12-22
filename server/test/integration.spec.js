/*
 * @Descripttion:
 * @Author: Gypsophlia
 * @Date: 2021-12-22 21:17:29
 * @LastEditTime: 2021-12-22 21:58:44
 */
/* eslint-disable no-plusplus */
/* eslint-disable no-undef */

// const { expect } = require("chai");
const WebSocket = require('ws');
const fs = require('fs');

const Runner = require('../modules/Runner');
const Tokenizer = require('../modules/Tokenizer');
const Parser = require('../modules/Parser');
const { stdout } = require('../utils/logger');
const { publicEncrypt, privateDecrypt } = require('../utils/encrypt');

const port = 8080;
const DB = [];

let wss;

describe('集成测试', () => {
  beforeEach(() => {
    wss = new WebSocket.Server({ port });
  });
  afterEach(() => {
    wss.close();
  });
  // 集成测试：运行主文件
  it('run test', (done) => {
    const tokenizer = new Tokenizer('./samples/test5.gy');
    stdout.info('server tokenizes the file ./samples/test5.json');
    tokenizer.tokenizeFile().then((tokenList) => {
      const parser = new Parser(tokenList);
      const AST = parser.processAST();
      fs.writeFileSync('./samples/test5.ast.json', JSON.stringify(AST));

      // new connection
      wss.on('connection', (ws) => {
        stdout.info('server runner the file ./samples/test5.ast.json');
        const runner = new Runner('./samples/test5.ast.json', ws, DB);
        runner.run();
        ws.on('message', (data) => {
          stdout.info('server receive: %s', privateDecrypt(data.toString()));
        });
        ws.on('close', (code, reason) => {
          stdout.info('server closed: %d %s', code, reason);
          done();
        });
      });

      const ws = new WebSocket('ws://localhost:8080');
      ws.on('open', () => {
        ws.on('message', (m) => {
          stdout.info('client receive: %s', m);
          ws.send(publicEncrypt(JSON.stringify({
            type: 'message',
            data: '1',
          })));
        });
      });
    });
  });
});
