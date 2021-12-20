// 防抖

export default function debounce(func, wait, immediate) {
  let timer;

  return function dd() {
    const context = this;
    // eslint-disable-next-line prefer-rest-params
    const args = arguments;

    if (timer) {
      // 不意味着 !timer === true
      clearTimeout(timer);
    }

    if (immediate) {
      if (!timer) {
        func.apply(context, args);
      }
      setTimeout(() => {
        timer = null;
      }, wait);
    } else {
      setTimeout(() => {
        func.apply(context, args);
      }, wait);
    }
  };
}
