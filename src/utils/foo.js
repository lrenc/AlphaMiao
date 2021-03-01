// 训练用AI
import lodash from 'lodash';
import MCTS from './mcts';
import Neuro from './neuro_for_node';
import random from './random';
import matrix from './matrix';
import { SIZE } from './constants';

export default class Foo {
  constructor() {
    this.playoutCount = 400;
  }

  async init() {
    this.neuro = new Neuro();
    await this.neuro.initModel();
    this.mcts = new MCTS(this.neuro, this.playoutCount);
  }

  upgrade() {
    this.playoutCount += 20;
    this.mcts.upgrade(this.playoutCount);
  }

  getValue() {
    return this.value;
  }

  setValue(value) {
    this.value = value;
  }

  reset(move) {
    this.mcts.updateForward(move);
  }

  choice(moves, probs) {
    let options = [];
    for (let i = 0; i < 7; i ++) {
      let move = random.choice(moves, probs);
      if (!~options.indexOf(move)) {
        options.push(move);
      }
    }
    let length = options.length;
    let choice = random.int(0, length - 1);
    return options[choice];
  }

  getAction(game) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let availables = game.availables;
        let history = game.history;
        let moveProbs = matrix.zeros([SIZE * SIZE]);
        if (availables.length) {
          let [moves, probs] = this.mcts.divination(game);
          moves.forEach((move, i) => {
            moveProbs[move] = probs[i];
          });
          let move;
          if (history.length < 12) {
            move = this.choice(moves, probs);
          } else {
            move = random.choice(moves, probs);
          }
          console.log(move);
          this.reset(move);
          resolve([lodash.toNumber(move), moveProbs]);
        } else {
          reject('the board is full');
        }
      });
    });
  }

  async save() {
    await this.neuro.saveModel();
  }

  async evolve(batch) {
    let states = [];
    let probs = [];
    let winners = [];
    batch.forEach(function(item) {
      states.push(item[0]);
      probs.push(item[1]);
      winners.push(item[2]);
    });
    await this.neuro.train(states, probs, winners);
  }

}
