/* eslint-disable no-unused-expressions */
/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/**
 * The module parses the file extnamed .token.json to .ast.json
 * @module Runner
 */

const fs = require('fs');

const { stdout } = require('../../utils/logger');
const { ErrorProcess } = require('./error');
const PreProcessor = require('./preprocess');
const Stack = require('../../utils/stack');
const sleep = require('../../utils/sleep');
const { privateDecrypt } = require('../../utils/encrypt');

// split listen time to a splice groups of INTERVAL ms
const INTERVAL = 500;

/**
 * Runn the .ast.json file
 * @extends PreProcessor
 */
class Runner extends PreProcessor {
  Detects = [];

  MessageDB;

  WS;

  /**
   *
   * @param {String} filename
   * @param {String} WS client websocket
   * @param {Array} MessageDB store the message
   * @param {Object} outer the outer variables
   */
  constructor(filename, WS, MessageDB, outer = {}) {
    super(JSON.parse(fs.readFileSync(filename)), outer);
    this.WS = WS;
    this.MessageDB = MessageDB;
  }

  /**
   * output the ast
   */
  outputAST() {
    console.log(this._AST);
  }

  /**
   * main function: run
   */
  async run() {
    try {
      if (this.WS.readyState === this.WS.OPEN) {
        await this.runBlock(this._AST.body);
      } else {
        this.WS.on('open', async () => {
          await this.runBlock(this._AST.body);
        });
      }
    } catch (error) {
      if (error.message !== 'exit') {
        stdout.error(error.message);
        return error.message;
      }
      stdout.info('Server disconnected.');
    }
    return null;
  }

  /**
   * run the block context
   * @param {Array} block
   */
  async runBlock(block) {
    // prepare the variable and branch
    this.prepare(block);

    for (const item of block) {
      switch (item.type) {
        case 'BranchEvent':
          // stdout.info('Run Branch %s', item.name.value);
          await this.runBranch(item.name.value);
          break;
        case 'Function':
          // stdout.info('Run Function %s', item.name);
          await this.runFunction(item);
          break;
        case 'AssignEvent':
          // stdout.info("Run Assign");
          await this.runAssign(item);
          break;
        default:
          break;
      }
    }

    // go back the last block context
    this.backtrace();
  }

  /**
   * run the branch named "name"
   * @param {String} name the branch name
   */
  async runBranch(name) {
    for (let i = this._Branch.length - 1; i >= 0; i--) {
      const item = this._Branch[i];
      if (item.name.type === 'String' && item.name.value === name) {
        await this.runBlock(item.block);
        return;
      } if (item.name.type === 'Identifier'
        && this.searchVariable(item.name.value).value === name) {
        await this.runBlock(item.block);
        return;
      }
    }
    ErrorProcess.UnexpectedBranch(name);
  }

  /**
   * run the function (send,listen...)
   * @param {Object} func
   */
  async runFunction(func) {
    switch (func.name) {
      case 'send':
        this.runSend(func.params);
        break;
      case 'listen':
        await this.runListen(func.params);
        break;
      case 'detect':
        await this.runDetect(func.params, func.block);
        break;
      case 'match':
        await this.runMatch(func.params);
        break;
      case 'goto':
        await this.runGoto(func.params);
        break;
      case 'exit':
        this.runExit();
        break;
      default:
        break;
    }
  }

  /**
   * process the postfix expression stack
   * @param {Object} item
   */
  async runAssign(item) {
    const src = this.searchVariable(item.src.value);
    const stack = new Stack();
    for (const op of item.operateStack) {
      if (op.type === 'Identifier') {
        stack.push(this.searchVariable(op.value).value);
      } else if (op.type === 'String') {
        stack.push(op.value);
      } else if (op.type === 'Numeric') {
        stack.push(parseInt(op.value, 10));
      } else {
        const b = stack.pop();
        const a = stack.pop();
        if (a === undefined || b === undefined) {
          ErrorProcess.NotFoundVariable(op.type);
        }
        if (typeof a !== typeof b) {
          ErrorProcess.TypeDismatch();
        }
        switch (op.type) {
          case 'ADD':
            stack.push(a + b);
            break;
          case 'SUB':
            stack.push(a - b);
            break;
          case 'MUL':
            stack.push(a * b);
            break;
          case 'DIV':
            stack.push(a / b);
            break;
          default:
            break;
        }
      }
    }

    if (stack.all().length === 1) {
      src.value = stack.pop();
    }
  }

  /**
   * the future can encrption the data
   * @param {Array} params
   */
  runSend(params) {
    let message = params[0].value || params[0].value;

    // process \n
    message = message.replace(/\\n/g, '\n');
    // process variable in string
    const matches = message.match(/\${\w*}/g);
    if (matches instanceof Array) {
      for (const match of matches) {
        const name = match.substr(2, match.length - 3);
        const { value } = this.searchVariable(name);
        const reg = new RegExp(`\\\${${name}}`, 'g');
        message = message.replace(reg, value);
      }
    }

    // main: send message
    // stdout.info("Run Send %s",message);
    this.WS.send(JSON.stringify({
      type: 'message',
      data: message,
    }));
    this.MessageDB.push({
      from: 'server',
      to: 'client id',
      content: message,
    });
  }

  /**
   * run listen function
   * @param {Array} params
   */
  async runListen(params) {
    const seconds = parseInt(params[0].value, 10);
    const replyName = params[1].value;

    // stdout.info("Run Listen: %d %s",seconds,replyName);

    // search for outer variable
    const reply = this.searchVariable(replyName);
    reply.value = '';

    // add listen event
    this.WS.on('message', (message) => {
      // Buffer.toString() => String || String.toString() => String
      const msg = JSON.parse(privateDecrypt(message.toString()));
      if (msg.type === 'message') {
        reply.value = msg.data;
        this.MessageDB.push({
          from: 'client id',
          to: 'server',
          content: msg.data,
        });
      }
    });

    // loop check if get reply in seconds
    let loops = Math.ceil((seconds * 1000) / INTERVAL);
    while (loops > 0) {
      if (reply.value !== '') {
        return;
      }
      // stdout.info("The server is waiting for client reply...");
      await sleep(INTERVAL);
      loops--;
    }

    // if no replt in listen times
    if (reply.value === '') {
      this.WS.send(JSON.stringify({
        type: 'message',
        data: '??????????????????',
      }));
      this.runExit();
    }
  }

  /**
   * run detect function
   * @param {Array} params
   * @param {Array} block
   */
  async runDetect(params, block) {
    let detector = params[0];
    if (detector === undefined) {
      ErrorProcess.NotFoundDetect();
    }

    if (detector?.type === 'Identifier') {
      detector = this.searchVariable(detector.value);
    }
    // stdout.info("Run Detect: %s",detector.value);
    this.Detects.push(detector.value);
    block && await this.runBlock(block);
    this.Detects.pop();
  }

  /**
   * run match function
   * @param {Array} params
   */
  async runMatch(params) {
    if (params.length === 1) {
      return;
    }
    const len = this.Detects.length - 1;
    if (len >= 0) {
      const detect = this.Detects[len];
      // "|" can split the msg to several words(tokens)
      const tokens = params[0].value.split('|');
      const branchName = params[1].value;
      for (const token of tokens) {
        // stdout.info(token, detect);
        if (detect.includes(token)) {
          await this.runBranch(branchName);
          return;
        }
      }
    }
  }

  /**
   * run function goto: goto the branch named "xxx"
   * @param {Array} params
   */
  async runGoto(params) {
    const branchName = params[0].value;
    await this.runBranch(branchName);
  }

  /**
   * run function exit
   */
  runExit() {
    this.WS.send(JSON.stringify({
      type: 'close',
      data: this.syncOuter(),
    }));
    this.WS.close();
    throw new Error('exit');
  }

  /**
   * search variable list for "name"
   * @param {String} name
   * @returns {Object}
   */
  searchVariable(name) {
    for (const va of this._Variable) {
      if (va.name === name) {
        if (va.value === undefined) {
          ErrorProcess.EmptyVariable(va.name);
        } else if (va.type === 'Numeric') {
          va.value = parseInt(va.value, 10);
        }
        return va;
      }
    }
    ErrorProcess.NotFoundVariable(name);
    return null;
  }
}

module.exports = Runner;
