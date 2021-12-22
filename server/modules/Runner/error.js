/**
 * @exports Runner/error
 */
module.exports.ErrorProcess = {
  /**
   * unknon branch name
   * @param {String} name
   */
  UnexpectedBranch(name) {
    throw new Error(`Branch Error: Unexpected branch ${name}`);
  },
  /**
   * unknow detect string
   */
  NotFoundDetect() {
    throw new Error('Detect Error: Not Found Detect');
  },
  /**
   * not found variable
   * @param {String} name
   */
  NotFoundVariable(name) {
    throw new Error(`Variable Error: Not Found Variable ${name}.`);
  },
  /**
   * variable is empty
   * @param {String} name
   */
  EmptyVariable(name) {
    throw new Error(`Variable Error: The Variable ${name} is empty.`);
  },
  /**
   * the type dismatch when assigned
   */
  TypeDismatch() {
    throw new Error('Type of both dismatches.');
  },
};
