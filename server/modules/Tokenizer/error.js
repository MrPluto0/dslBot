/**
 * ErrorProcess for Tokenizer
 * @exports Tokenizer/error
 */
module.exports.ErrorProcess = {
  /**
   * meet an unexpected character
   * @param {String} c
   */
  throwUnexpected(c) {
    throw new Error(`Tokenize Error: unexpected character ${c}.`);
  },
};
