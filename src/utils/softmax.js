/**
 * softmax 函数
 */

export default function softmax(arr) {
  let max = Math.max(...arr);
  let expSum = 0;
  let expArr = arr.map(function(item) {
    let expI = Math.exp(item - max);
    expSum += expI;
    return expI;
  });
  return expArr.map(function(item) {
    return item / expSum;
  });
}
