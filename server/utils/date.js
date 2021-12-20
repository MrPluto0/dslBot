/**
 * date format utils
 * @export utils/date
 */
module.exports = {
  /**
   * get now time format "xx:xx"
   * @returns {String}
   */
  getTime() {
    const date = new Date();
    return `${date.getHours()}:${date.getMinutes()}`;
  },
  /**
   * get now date format "year-month-date"
   * @returns {String}
   */
  getDate() {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  },
};
