// 一些快速创建多维数组的方法
import lodash from 'lodash';

export function zeros(shape) {
  if (shape.length === 1) {
    return Array(shape[0]).fill(0);
  }
  let size = lodash.head(shape);
  let array = [];
  for (let i = 0; i < size; i ++) {
    array.push(zeros(lodash.drop(shape)));
  }
  return array;
}

// 二维数组顺时针旋转90度
export function rot90(array) {
  let height = array.length;
  let width = array[0].length;
  let rotate = zeros([width, height]);
  for (let i = 0; i < height; i ++) {
    for (let j = 0; j < width; j ++) {
      rotate[j][width - i - 1] = array[i][j];
    }
  }
  return rotate;
}

// 二维数组左右反转
export function fliplr(array) {
  let height = array.length;
  let width = array[0].length;
  let flip = zeros([width, height]);
  for (let i = 0; i < height; i ++) {
    for (let j = 0; j < width; j ++) {
      flip[i][width - j - 1] = array[i][j];
    }
  }
  return flip;
}

// 这里只处理一维转二维
export function reshape(array, shape) {
  let width = shape[0];
  let height = shape[1];
  let result = zeros(shape);
  for (let i = 0; i < height; i ++) {
    for (let j = 0; j < width; j ++) {
      result[i][j] = array[i * height + j];
    }
  }
  return result;
}

export function shape(array) {
  let list = array;
  let type = [];
  while(lodash.isArray(list)) {
    type.push(list.length);
    list = list[0];
  };
  return type;
}

export default {
  zeros,
  shape,
  rot90,
  reshape,
  fliplr,
};
