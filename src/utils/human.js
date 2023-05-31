
import lodash from 'lodash';
import event from './event';

export default class Human {
  constructor() {
    this.name = 'HUMAN';
  }
  setValue(value) {
    this.value = value;
  }

  getValue() {
    return this.value;
  }

  getAction(state) {
    return new Promise((resolve, reject) => {
      event.listen('action', (move) => {
        let availables = state.availables;
        if (availables.length) {
          resolve(lodash.toNumber(move));
        } else {
          reject('the board is full');
        }
      });
    });
  }
}
