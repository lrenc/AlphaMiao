// 训练
import lodash from 'lodash';
import Foo from './utils/foo';
import Game from './utils/game';
import random from './utils/random';
import matrix from './utils/matrix';
import { SIZE } from './utils/constants';

// 通过旋转和反转来扩展数据
function extend(data) {
  let full = [];
  let state = data[0];
  let probs = data[1];
  let turns = data[2];
  for (let i = 0; i < 4; i ++) {
    state = state.map(item => matrix.rot90(item));
    probs = lodash.flatten(matrix.rot90(matrix.reshape(probs, [SIZE, SIZE])));
    full.push([state, probs, turns]);

    state = state.map(item => matrix.fliplr(item));
    probs = lodash.flatten(matrix.fliplr(matrix.reshape(probs, [SIZE, SIZE])));
    full.push([state, probs, turns]);
  }
  return full;
}

let count = 0;
// ai 自我对弈
async function collect(player) {
  let game = new Game();
  let result = await game.selfPlay(player);
  count ++;
  return result[1];
}

async function main() {
  const batchSize = 512;
  const total = batchSize * 20;
  const player = new Foo();
  await player.init();
  let cache = [];
  for (let i = 0; i < total * 2; i ++) {
    let data = await collect(player);
    for (let item of data) {
      cache = lodash.concat(cache, extend(item));
    }
    console.log('length:', data.length, cache.length, count);
    if (cache.length > batchSize) {
      let batch = random.sample(cache, batchSize);
      await player.evolve(batch);
    }
    if (count % 100 === 0) {
      player.upgrade();
    }
    if (cache.length > total) {
      cache = cache.slice(batchSize);
    }
  }
}

main();
