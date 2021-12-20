/* eslint-disable prefer-rest-params */
// 该节流不同于一般节流，会推迟函数运行，间隔相同

export default function throttle(func, wait) {
  let count = 0;
  return function f() {
    setTimeout(() => {
      count += 1;
      func.apply(this, arguments);
      count -= 1;
    }, wait * count);
  };
}
