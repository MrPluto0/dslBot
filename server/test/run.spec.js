/* eslint-disable no-plusplus */
/* eslint-disable no-undef */

// const { expect } = require("chai");
const WebSocket = require('ws');
const fs = require('fs');

const Runner = require('../modules/Runner');
const Tokenizer = require('../modules/Tokenizer');
const Parser = require('../modules/Parser');
const { stdout } = require('../utils/logger');

const port = 8080;

describe('集成功能测试', () => {
  it('run test', (done) => {
    const msg = '1';
    const DB = [];
    const wss = new WebSocket.Server({ port });

    const tokenizer = new Tokenizer('./samples/test5.gy');
    tokenizer.tokenizeFile().then((symbolTable) => {
      fs.writeFileSync('./samples/test5.token.json', JSON.stringify(symbolTable));
      stdout.info('server tokenizes the file ./samples/test5.json');

      const parser = new Parser(symbolTable);
      const AST = parser.processAST();
      fs.writeFileSync('./samples/test5.ast.json', JSON.stringify(AST));
      stdout.info('server parses the file ./samples/test5.token.json');

      // new connection
      wss.on('connection', (ws) => {
        const runner = new Runner('./samples/test5.ast.json', ws, DB);
        runner.run();
        ws.on('message', (data) => {
          stdout.info('server receive: %s', JSON.parse(data));
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
          ws.send(JSON.stringify({
            type: 'message',
            data: msg,
          }));
        });
      });
    });
  });
});
