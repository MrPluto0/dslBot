/* eslint-disable class-methods-use-this */
const TYPE = require('../static/token.json');

/**
 * judge the character's type for tokenizer
 */
class Judge {
  /**
   * if val is jump character
   * @param {String} val
   * @returns {bool}
   */
  isJump(val) {
    return [undefined, ' ', '\t', '\n', '\r'].includes(val);
  }

  /**
   * if val is a digit
   * @param {String} val
   * @returns {bool}
   */
  isDigit(val) {
    return val >= '0' && val <= '9';
  }

  /**
   * if val is Alpha
   * @param {String} val
   * @returns {bool}
   */
  isAlpha(val) {
    return (val >= 'a' && val <= 'z') || (val >= 'A' && val <= 'Z');
  }

  /**
   * if val is one of the Operator (from static/token.json)
   * @param {String} val
   * @returns {bool}
   */
  isOperator(val) {
    return (val in TYPE.Operator);
  }

  /**
   * if val is one of the Boundary (from static/token.json)
   * @param {String} val
   * @returns {bool}
   */
  isBoundary(val) {
    return (val in TYPE.Boundary);
  }
}

module.exports = Judge;
