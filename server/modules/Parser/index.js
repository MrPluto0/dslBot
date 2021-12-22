/* eslint-disable no-plusplus */
/**
 * The module parses the file extnamed .token.json to .ast.json
 * @module Parser
 */
const { ErrorProcess } = require('./error');
const Stack = require('../../utils/stack');
const { stdout } = require('../../utils/logger');

/**
 * Parser
 */
class Parser {
  #symbolTable = [];

  #AST = {
    type: 'Script',
    body: [],
  };

  /**
   * @param {Array} symbolTable the same as tokenList
   */
  constructor(symbolTable) {
    this.#symbolTable = symbolTable;

    this.index = 0; // current index of charactor
    this.block = this.#AST.body; // current block context
    this.blockList = new Stack([this.#AST.body]); // block list
    this.stack = new Stack([]); // stack composed of { and }
  }

  /**
   * process tokenList to AST
   * @returns {Array} AST
   */
  processAST() {
    try {
      while (this.index < this.#symbolTable.length) {
        const symbol = this.#symbolTable[this.index];
        // console.log(symbol);
        this.index++;

        // just process the head of each line
        switch (symbol.value) {
          case 'var':
            this.processDeclare();
            break;
          case 'branch':
            this.processBranch();
            break;
          case 'send':
            this.processSend();
            break;
          case 'listen':
            this.processListen();
            break;
          case 'detect':
            this.processDetect();
            break;
          case 'match':
            this.processMatch();
            break;
          case 'goto':
            this.processGoto();
            break;
          case 'exit':
            this.processExit();
            break;
          case '{':
          case '}':
            this.processBlock(symbol);
            break;
          default:
            break;
        }
        // process the assign
        if (symbol.type === 'Identifier') {
          // console.log(this.#symbolTable[this.index],symbol);
          this.processAssign(symbol);
        }
      }
    } catch (e) {
      stdout.error(e.message);
      console.log(e);
    }
    return this.#AST;
  }

  /**
   * process a Block, to begin with "symbol"
   * @param {Object} symbol
   */
  processBlock(symbol) {
    if (symbol.value === '{') {
      this.stack.push('{');
      this.blockList.push(this.block);
      this.block = this.block[this.block.length - 1]?.block;
    } else if (symbol.value === '}') {
      if (this.stack.top() === '{') {
        this.stack.pop();
        this.block = this.blockList.pop();
      } else ErrorProcess.Block.throwMatchError();
    }
  }

  /**
   * process the declaration, to begin with "var = xxx"
   */
  processDeclare() {
    const declarations = [];
    let end = false; // if the declare ended
    let next = true; // if the next word can be added to declarations
    while (this.index < this.#symbolTable.length) {
      const symbol = this.#symbolTable[this.index];
      const last = declarations.length > 0 ? declarations[declarations.length - 1] : null;
      switch (symbol.type) {
        case 'Identifier':
          if (next) {
            declarations.push({
              name: symbol.value,
            });
            next = false;
          } else {
            end = true;
          }
          break;
        case 'Assign':
          last.init = {};
          break;
        case 'Numeric':
          ErrorProcess.VariableDeclaration.checkInit(last);
          last.init = {
            source: 'inner',
            type: 'Numeric',
            value: symbol.value,
          };
          break;
        case 'String':
          ErrorProcess.VariableDeclaration.checkInit(last);
          last.init = {
            source: 'inner',
            type: 'String',
            value: symbol.value,
          };
          break;
        case 'Comma':
          next = true;
          break;
        case 'KeyWord':
          if (symbol.value === 'outer') {
            ErrorProcess.VariableDeclaration.checkInit(last);
            last.init = {
              source: 'outer',
            };
          } else {
            end = true;
          }
          break;
        case 'LeftBrace':
          this.processBlock(symbol);
          end = true;
          break;
        default:
          console.log(symbol);
          ErrorProcess.VariableDeclaration.throwUnknownError();
          break;
      }
      if (end) {
        this.block.push({
          type: 'VariableDeclaration',
          declarations,
        });
        return;
      }
      this.index++;
    }
  }

  /**
   * process assign, to begin with Identifier
   * @param {Object} symbol
   */
  processAssign(symbol) {
    if (this.#symbolTable[this.index].type === 'Assign') {
      this.index++;
      this.block.push({
        type: 'AssignEvent',
        src: symbol,
        operateStack: this.processCompute(),
      });
    }
  }

  /**
   * preocess compute operations, from infix to postfix
   * @returns {Array}OperateStack
   */
  processCompute() {
    const operateStack = new Stack();
    const tempStack = new Stack();
    let end = false; let
      turn = 0;
    while (!end && this.index < this.#symbolTable.length) {
      const symbol = this.#symbolTable[this.index];
      this.index++;
      switch (symbol.type) {
        case 'Identifier':
        case 'Numeric':
        case 'String':
          if (turn === 0) {
            operateStack.push(symbol);
            turn = 1;
          } else {
            end = true;
          }
          break;
        case 'ADD':
        case 'SUB':
        case 'MUL':
        case 'DIV':
          if (turn === 1) {
            while (tempStack.top() && tempStack.top().type === 'LeftParen') {
              if ('ADD|SUB'.includes(symbol.type) && 'ADD|SUB|MUL|DIV'.includes(tempStack.top().type)) { operateStack.push(tempStack.pop()); } else if ('MUL|DIV'.includes(symbol.type) && 'MUL|DIV'.includes(tempStack.top().type)) { operateStack.push(tempStack.pop()); } else { break; }
            }
            tempStack.push(symbol);
            turn = 0;
          } else {
            end = true;
          }
          break;
        case 'LeftParen':
          tempStack.push(symbol);
          break;
        case 'RightParen':
          while (tempStack.top() && tempStack.top().type !== 'LeftParen') {
            operateStack.push(tempStack.pop());
          }
          tempStack.pop();
          break;
        default:
          end = true;
          break;
      }
    }
    if (this.index < this.#symbolTable.length) { this.index--; }
    while (tempStack.top()) {
      operateStack.push(tempStack.pop());
    }
    // console.log(operateStack.all());
    return operateStack.all();
  }

  /**
   * process branch
   */
  processBranch() {
    const name = this.processParams()[0];
    ErrorProcess.Branch.checkBranchName(name);

    this.block.push({
      type: 'BranchEvent',
      name,
      block: [],
    });
  }

  /**
   * process send
   */
  processSend() {
    this.block.push({
      type: 'Function',
      name: 'send',
      params: this.processParams(),
    });
  }

  /**
   * process listen
   */
  processListen() {
    this.block.push({
      type: 'Function',
      name: 'listen',
      params: this.processParams(),
    });
  }

  /**
   * process detect
   */
  processDetect() {
    this.block.push({
      type: 'Function',
      name: 'detect',
      params: this.processParams(),
      block: [],
    });
  }

  /**
   * process match
   */
  processMatch() {
    this.block.push({
      type: 'Function',
      name: 'match',
      params: this.processParams(),
    });
  }

  /**
   * process goto
   */
  processGoto() {
    this.block.push({
      type: 'Function',
      name: 'goto',
      params: this.processParams(),
    });
  }

  /**
   * process exit
   */
  processExit() {
    this.block.push({
      type: 'Function',
      name: 'exit',
    });
  }

  /**
   * process the params of above functions
   * @returns {Array}
   */
  processParams() {
    const params = [];
    let matched;
    let next = true;
    while (!matched && this.index < this.#symbolTable.length) {
      const symbol = this.#symbolTable[this.index];
      switch (symbol.type) {
        case 'LeftParen':
          matched = false;
          break;
        case 'RightParen':
          if (matched === false) matched = true;
          break;
        case 'Comma':
          next = true;
          break;
        case 'Numeric':
        case 'Identifier':
        case 'String':
          if (next) params.push(symbol);
          else ErrorProcess.Function.throwParamsError();
          next = false;
          break;
        default:
          ErrorProcess.Function.throwUnknownError();
          break;
      }
      this.index++;
    }
    return params;
  }
}

module.exports = Parser;
