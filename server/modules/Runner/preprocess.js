/**
 * @class PreProcessor
 * store the variable, branch, block
 */
class PreProcessor {
  _AST = {};

  _Variable = [];

  _Branch = [];

  _Block = [];

  #outer = {};

  constructor(ast, outer) {
    this._AST = ast;
    this.#outer = outer;
  }

  /**
   * prepare the variable and branch events
   * @param {Object} block
   */
  prepare(block) {
    let varLen = 0;
    let branchLen = 0;
    block.forEach((item) => {
      if (item.type === 'VariableDeclaration') {
        item.declarations.forEach((variable) => {
          const temp = {
            name: variable.name,
            type: undefined,
            value: undefined,
          };
          // if init by some value
          if ('init' in variable) {
            temp.value = variable.init.value;
            temp.type = variable.init.type;
            if (temp.type === 'Numeric') { temp.value = parseInt(temp.value, 10); }
          }
          // if variable's value from outer
          if (variable.init?.source === 'outer') {
            temp.value = this.#outer[variable.name];
            if (typeof temp.value === 'number') { temp.type = 'Numeric'; } else if (typeof temp.value === 'string') { temp.type = 'String'; }
          }
          this._Variable.push(temp);
          varLen += 1;
        });
      }
      if (item.type === 'BranchEvent') {
        branchLen += 1;
        this._Branch.push(item);
      }
    });
    this._Block.push({
      entry: block,
      varLen,
      branchLen,
    });
  }

  /**
   * backtrace the last state
   */
  backtrace() {
    const block = this._Block.pop();
    let start = this._Branch.length - block.branchLen;
    this._Branch.splice(start, block.branchLen);

    start = this._Variable.length - block.varLen;
    this._Variable.splice(start, block.varLen);
  }

  /**
   * sync the data from outer
   * @returns {Array}
   */
  syncOuter() {
    this._Variable.forEach((item) => {
      if (item.name in this.#outer) {
        this.#outer[item.name] = item.value;
      }
    });
    return this.#outer;
  }
}

module.exports = PreProcessor;
