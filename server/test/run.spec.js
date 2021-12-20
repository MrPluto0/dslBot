/* eslint-disable no-undef */

// const { expect } = require("chai");
const WebSocket = require('ws');
const Runner = require('../modules/Runner');

const port = 8080;

describe('运行测试', () => {
  it('readfile', () => {
    const runner = new Runner('./samples/test3.ast.json');
    runner.outputAST();
  });
  it('run test', (done) => {
    const DB = [];
    const wss = new WebSocket.Server({ port });

    // new connection
    wss.on('connection', (ws) => {
      const runner = new Runner('./samples/test3.ast.json', ws, DB);
      ws.on('close', (code, reason) => {
        console.log('server closed: %d %s', code, reason);
      });
      ws.on('message', (message) => {
        console.log('server receive: %s', message);
        ws.send(message);
        runner.run();
        done();
      });
    });

    const ws = new WebSocket('ws://localhost:8080');
    ws.on('open', () => {
      ws.send('OK');
      ws.on('message', (m) => {
        console.log('client receive: %s', m);
        // 测试结束主动关闭
        ws.close();
      });
    });
  });
});
