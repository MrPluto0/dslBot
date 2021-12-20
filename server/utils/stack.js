/**
 * @module utils/Stack
 */

/**
 * @class Stack
 */
class Stack {
  #container = [];

  constructor(stack = []) {
    this.#container = stack;
  }

  /**
   * push an item(items)
   * @param {...any} item
   */
  push(item) {
    this.#container.push(item);
  }

  /**
   * pop the last item
   * @returns {any} the last item
   */
  pop() {
    return this.#container.pop();
  }

  /**
   * get the last item
   * @returns {any} the last item
   */
  top() {
    if (this.#container.length > 0) { return this.#container[this.#container.length - 1]; }
    return null;
  }

  /**
   * get the stack Array
   * @returns {Array}
   */
  all() {
    return this.#container;
  }
}

module.exports = Stack;
