
import lodash from 'lodash';

export function int(a, b) {
  if (typeof b === 'undefined') {
    b = a;
    a = 0;
  }
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

export function choice(array, prob) {
  let weight = [];
  let length = array.length;
  prob.forEach((item, i) => {
    if (i === 0) {
      weight[i] = prob[i];
    } else {
      weight[i] = weight[i - 1] + prob[i];
    }
  });
  let count = Math.random();
  let index;
  for (let i = 0; i < length; i ++) {
    if (count <= weight[i]) {
      index = i;
      break;
    }
  }
  return array[index];
}

export function top(array, prob, n) {
  let limit = Math.ceil(array.length / (n * 100));
  let list = lodash.zip(array, prob);
  list.sort(function(a, b) {
    return b[1] - a[1];
  });
  let index;
  if (limit === 1) {
    index = 0;
  } else {
    index = int(limit - 1);
  }
  return list[index][0];
}

export function shuffle(array) {
  let length = array.length;
  for (let i = 0; i < length * 2; i ++) {
    let index = int(0, length - 1);
    let trans = Math.floor(i / 2);
    let temp = array[index];
    array[index] = array[trans];
    array[trans] = temp;
  }
  return array;
}

export function sample(array, size) {
  let batch = [];
  let length = array.length;
  if (size >= length) {
    return array.slice();
  }
  while (true) {
    let index = int(0, length - 1);
    if (!~batch.indexOf(index)) {
      batch.push(index);
    }
    if (batch.length === size) {
      break;
    }
  }
  let result = [];
  array.forEach((item, index) => {
    if (~batch.indexOf(index)) {
      result.push(item);
    }
  });
  return result;
}

export function pick(array, size = 1) {
  let length = array.length;
  if (size > length) {
    size = length;
  }
  if (size === 1) {
    let index = int(0, length - 1);
    return array[index];
  }
  let result = [];
  for (let i = 0; i < size; i ++) {
    let index = int(0, length - 1);
    result.push(array[index]);
  }
  return result;
}

export default {
  int,
  choice,
  shuffle,
  sample,
  top,
  pick
};
