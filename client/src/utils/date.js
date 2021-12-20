export default {
  getTime() {
    const date = new Date();
    const minutes = date.getMinutes();
    return `${date.getHours()}:${minutes > 9 ? minutes : `0${minutes}`}`;
  },
  getDate() {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  },
};
