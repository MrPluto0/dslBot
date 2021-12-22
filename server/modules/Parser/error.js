/**
 * process error for parser
 * @exports Parser/error
 */
module.exports.ErrorProcess = {
  /**
   * use variable before assigned or find unknown variable
   */
  VariableDeclaration: {
    checkInit(declaration) {
      if ('init' in declaration) { return; }
      throw new Error('VariableDeclaration Error: missing assign.');
    },
    throwUnknownError() {
      throw new Error('VariableDeclaration Error: Unknown Character in the end.');
    },
  },
  /**
   * find unknown branch name
   */
  Branch: {
    checkBranchName(symbol) {
      if (symbol && (symbol.type === 'String' || symbol.type === 'Identifier')) { return; }
      throw new Error("Branch Error: Can't find branch name.");
    },
  },
  /**
   * match unknown block
   */
  Block: {
    throwMatchError() {
      throw new Error('Function Error: Block Matched Error');
    },
  },
  /**
   * Function error in analyze params
   */
  Function: {
    checkString(symbol) {
      if (symbol.type === 'String') { return; }
      throw new Error("Function Error: Can't identify.");
    },
    checkComma(symbol) {
      if (symbol.type === 'Comma') { return; }
      throw new Error("Function Error: Can't identify.");
    },
    throwParamsError() {
      throw new Error('Function Error: Comma should between params.');
    },
    throwUnknownError() {
      throw new Error('Function Error: Unknown Character in the end.');
    },
  },
  /**
   * compute error
   */
  ComputeError: {
    throwDismatchError() {
      throw new Error('Operator and Charactor dismatch');
    },
  },
};
