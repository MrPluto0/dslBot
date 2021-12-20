/* eslint-disable no-undef */

const { expect } = require('chai');
const fs = require('fs');
const Tokenizer = require('../modules/Tokenizer');
const Parser = require('../modules/Parser');

describe('Parser类测试', () => {
  it('processDeclare', async () => {
    const tokenizer = new Tokenizer('./samples/test1.gy');
    const symbolTable = await tokenizer.tokenizeFile();
    // console.log(symbolTable);

    const parser = new Parser(symbolTable);
    const AST = parser.processAST();

    expect(typeof AST).to.be.equal('object');
  });
  it('processDeclare', async () => {
    const tokenizer = new Tokenizer('./samples/test3.gy');
    const symbolTable = await tokenizer.tokenizeFile();
    fs.writeFileSync('./samples/test3.token.json', JSON.stringify(symbolTable));

    const parser = new Parser(symbolTable);
    const AST = parser.processAST();
    expect(typeof AST).to.be.equal('object');

    // for(let item of AST.body){
    // console.log(item);
    // }
    fs.writeFileSync('./samples/test3.ast.json', JSON.stringify(AST));
  });
});
