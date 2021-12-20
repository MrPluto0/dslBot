/* eslint-disable no-undef */

const { expect } = require('chai');
const Judge = require('../../modules/Tokenizer/judge');
const Tokenizer = require('../../modules/Tokenizer/index');

const judge = new Judge();

describe('Judge类测试', () => {
  it('isDigit', () => {
    expect(judge.isDigit('1')).to.be.equal(true);
    expect(judge.isDigit(' ')).to.be.equal(false);
  });
  it('isAlpha', () => {
    expect(judge.isAlpha(' ')).to.be.equal(false);
    expect(judge.isAlpha('a')).to.be.equal(true);
  });
  it('isOperator', () => {
    expect(judge.isOperator('=')).to.be.equal(true);
    expect(judge.isOperator('!')).to.be.equal(false);
  });
  it('isBoundary', () => {
    expect(judge.isBoundary('(')).to.be.equal(true);
    expect(judge.isBoundary('!')).to.be.equal(false);
  });
  it('isJump', () => {
    expect(judge.isJump(' ')).to.be.equal(true);
    expect(judge.isJump('!')).to.be.equal(false);
  });
});

describe('Tokenizer类测试', () => {
  it('tokenizerFile', async () => {
    const tokenizer = new Tokenizer('./samples/test.gy');
    const content = await tokenizer.tokenizeFile();
    expect(content instanceof Array).to.be.equal(true);
  });
});
