/* eslint-disable no-continue */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-syntax */

/**
 * the module can tokenize file extnamed .gy to file .token.json
 * @module Tokenizer
 */

const readline = require('readline');
const fs = require('fs');
const Judge = require('./judge');
const TYPE = require('../static/token.json');
const { ErrorProcess } = require('./error');
const { stdout } = require('../../utils/logger');

/**
 * @class
 * tokenize file extnamed .gy
 * @extends Judge
 */
class Tokenizer extends Judge {
  #filename;

  #tokenList;

  /**
   * create a tokenizer
   * @param {String} filename
   */
  constructor(filename) {
    super();
    this.#filename = filename;
    this.#tokenList = [];
  }

  /**
   * @description readFile and tokenize
   */
  async tokenizeFile() {
    try {
      const fileStream = fs.createReadStream(this.#filename);

      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });

      for await (const line of rl) {
        // console.log(line);
        this.tokenizeLine(line);
      }
    } catch (e) {
      stdout.error(e.message);
      return e.message;
    }
    return this.#tokenList;
  }

  /**
   * tokenize the line
   * @param {String} line
   */
  tokenizeLine(line) {
    let state = 0;
    let token = { value: '', type: '' };
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      switch (state) {
        case 0:
          if (this.isJump(c)) {
            continue;
          } else if (this.isAlpha(c)) {
            state = 1;
          } else if (this.isDigit(c)) {
            state = 2;
          } else if (this.isOperator(c)) {
            state = 4;
          } else if (c === '"') {
            state = 5;
          } else if (this.isBoundary(c)) {
            state = 6;
          } else {
            ErrorProcess.throwUnexpected(c);
          }
          token.type = this.getTokenType(state);
          break;
        case 1:
          if (this.isAlpha(c) || this.isDigit(c) || c === '_') {
            state = 1;
          } else {
            state = 99;
          }
          break;
        case 2:
          if (this.isDigit(c)) {
            state = 2;
          } else if (c === '.') {
            state = 3;
          } else {
            state = 99;
          }
          break;
        case 3:
          if (this.isDigit(c)) {
            state = 3;
          } else {
            state = 99;
          }
          break;
        case 4:
          if (['>=', '<=', '==='].includes(token.value + c)) {
            state = 100;
          } else {
            state = 99;
          }
          break;
        case 5:
          if (c === '"') {
            state = 100;
          } else {
            state = 5;
          }
          break;
        case 6:
          state = 99;
          break;
        default:
          break;
      }

      // other character
      if (state === 99) {
        i--;
      } else {
        token.value += line[i];
      }

      if (state === 99 || state === 100) {
        // end state
        token.value = token.value.replace(/^"|"$/g, '');
        this.setTokenType(token);
        this.#tokenList.push(token);
        token = { value: '', type: '' };
        state = 0;
      } else if (i === line.length - 1) {
        // last character
        this.setTokenType(token);
        this.#tokenList.push(token);
        break;
      }
    }
  }

  /**
   * according to state, deduction the type
   * @param {Number} state
   * @returns {String}
   */
  getTokenType(state) {
    let type = '';
    switch (state) {
      case 1:
        type = 'Identifier';
        break;
      case 2:
        type = 'Numeric';
        break;
      case 4:
        type = 'Operator';
        break;
      case 5:
        type = 'String';
        break;
      case 6:
        type = 'Boundary';
        break;
      default:
        break;
    }
    return type;
  }

  /**
   * according to state, update the type
   * @param {Object}
   */
  setTokenType(token) {
    if (token.type === 'Identifier') {
      if (TYPE.KeyWord.includes(token.value.toLowerCase())) {
        token.type = 'KeyWord';
      }
    } else if (token.type === 'Operator') {
      token.type = TYPE.Operator[token.value];
    } else if (token.type === 'Boundary') {
      token.type = TYPE.Boundary[token.value];
    }
  }
}

module.exports = Tokenizer;
