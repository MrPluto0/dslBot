/* eslint-disable no-plusplus */
// npm node_modules
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

// self modules
const { logger, stdout } = require('./utils/logger');
const Tokenizer = require('./modules/Tokenizer');
const Parser = require('./modules/Parser');
const Runner = require('./modules/Runner');

// global static variables
const port = 8080;
const DB = [];
const defaultFileName = 'test';

let ClientsCount = 0;

// compile file (Tokenizer, Parser)
async function compile(filename = defaultFileName, ws = null) {
  // the three kinds of path
  const filepath = path.resolve(__dirname, 'samples', `${filename}.gy`);
  const tokenpath = path.resolve(__dirname, 'samples', `${filename}.token.json`);
  const astpath = path.resolve(__dirname, 'samples', `${filename}.ast.json`);

  // if .gy file exists
  if (!fs.existsSync(filepath)) {
    stdout.info(`Server can't find file ${filepath}`);
    // eslint-disable-next-line no-unused-expressions
    ws && ws.close();
    return false;
  }

  // if .token file exists
  if (!fs.existsSync(tokenpath)) {
    const tokenizer = new Tokenizer(filepath);
    const symbolTable = await tokenizer.tokenizeFile();
    fs.writeFileSync(tokenpath, JSON.stringify(symbolTable));
  }

  // if .ast file exists
  if (!fs.existsSync(astpath)) {
    const symbolTable = JSON.parse(fs.readFileSync(tokenpath));
    const parser = new Parser(symbolTable);
    const AST = parser.processAST();
    fs.writeFileSync(astpath, JSON.stringify(AST));
  }

  logger.info(`Server compiled file success ${filepath}`);
  stdout.info(`Server compiled file success ${filepath}`);

  return true;
}

// callback to run websocket server
compile().then(() => {
  const wss = new WebSocket.Server({ port });
  logger.info(`Server connected.(Port:${port})`);
  stdout.info(`Server connected.(Port:${port})`);

  // new connection
  wss.on('connection', async (ws, req) => {
    // new client enters
    const ClientId = (ClientsCount++);
    const { host } = req.headers;
    logger.info(`ID:${ClientId} Client connected, IP:${host}`);
    stdout.info(`ID:${ClientId} Client connected, IP:${host}`);

    // runner the AST
    const maxWaitTime = 10000;
    let firstReply = false;
    let runner;

    // close event
    ws.on('close', (code, reason) => {
      stdout.info('ID:%d Server closed: %d %s', ClientId, code, reason);
    });

    // message event
    ws.on('message', (message) => {
      stdout.info('ID:%d Server receive: %s', ClientId, message);

      const msg = JSON.parse(message);
      if (msg.type === 'init') {
        stdout.info('ID:%d Server init Runner', ClientId);
        firstReply = true;

        const script = msg.script || defaultFileName;
        const abpath = path.resolve(__dirname, 'samples', `${script}.ast.json`);

        // if not exists abpath, then compile
        if (!fs.existsSync(abpath)) {
          compile(script, ws).then((success) => {
            if (success) {
              runner = new Runner(abpath, ws, DB, msg.data);
              runner.run();
            }
          });
        } else {
          runner = new Runner(abpath, ws, DB, msg.data);
          runner.run();
        }
      }
    });

    // first heartbeat test
    // if no replt in maxWaitTime, then exit;
    setTimeout(() => {
      if (!firstReply) {
        ws.close();
      }
    }, maxWaitTime);
  });
});
