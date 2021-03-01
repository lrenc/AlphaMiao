
import lodash from 'lodash';
import MCTS from './mcts';
import Neuro from './neuro_for_web';
import random from './random';
import matrix from './matrix';
import { SIZE } from './constants';

export default class AI {
  constructor() {
    this.playoutCount = 900;
    this.isSelfplay = false;
  }

  async init(id) {
    this.neuro = new Neuro();
    await this.neuro.initModel();
    this.mcts = new MCTS(this.neuro, this.playoutCount);
  }

  setValue(value) {
    this.value = value;
  }

  getValue() {
    return this.value;
  }

  reset() {
    this.mcts.updateForward(-1);
  }

  getAction(game) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let availables = game.availables;
        let moveProbs = matrix.zeros([SIZE * SIZE]);
        if (availables.length) {
          let [moves, probs] = this.mcts.divination(game);
          moves.forEach((move, i) => {
            moveProbs[move] = probs[i];
          });
          let move = random.choice(moves, probs);
          this.reset();
          resolve(lodash.toNumber(move));
        } else {
          reject('the board is full');
        }
      });
    });
  }
}
