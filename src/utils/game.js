import lodash from 'lodash';
import matrix from './matrix';
import event from './event';
import { SIZE } from './constants';

export default class Game {
  constructor() {
    this.availables = lodash.range(SIZE * SIZE);
    this.history = [];
    this.currentIndex = 0;
    this.values = [1, 2];
    this.initBoard(SIZE);
  }

  initBoard() {
    this.board = matrix.zeros([SIZE, SIZE]);
  }

  initPlayer(players, startIndex) {
    this.currentIndex = startIndex;
  }

  async start(players, startIndex = 0, visible = true) {
    this.initPlayer(players, startIndex);
    while (true) {
      let { currentIndex } = this;
      let player = players[currentIndex];
      let move = await player.getAction(this);
      this.action(move);
      if (visible) {
        event.dispatch('play', player);
      }
      let [ end, winner ] = this.isEnd();
      if (end && visible) {
        event.dispatch('end', winner);
        break;
      }
    }
  }

  async selfPlay(player) {
    let state = [];
    let probs = [];
    let turns = [];
    let startTime = Date.now();
    while (true) {
      let [move, moveProbs] = await player.getAction(this);
      state.push(this.getFeature());
      probs.push(moveProbs);
      turns.push(this.getCurrentValue());
      this.action(move);
      let [end, winner] = this.isEnd();
      if (end) {
        console.log('game end, winner is', winner);
        console.log(Date.now() - startTime, 'ms');
        let winners = matrix.zeros([turns.length]);
        if (winner) {
          winners = turns.map(item => {
            return item === winner ? 1 : -1;
          });
        }
        player.reset();
        return [winner, lodash.zip(state, probs, winners)];
      }
    }
  }

  toLocation(move) {
    let i = Math.floor(move / SIZE);
    let j = move % SIZE;
    return [i, j];
  }

  toMove(location) {
    let i = location[0];
    let j = location[1];
    return i * SIZE + j;
  }

  isAvailable(move) {
    return this.availables.length
      && ~this.availables.indexOf(move);
  }

  action(move) {
    if (this.isAvailable(move)) {
      let value = this.getCurrentValue();
      let location = this.toLocation(move);
      let index = this.availables.indexOf(move);
      this.board[location[0]][location[1]] = value;
      this.availables.splice(index, 1);
      this.history.push(move);
      this.nextPlayer();
    }
  }

  nextPlayer() {
    let index = this.currentIndex;
    if (index === 1) {
      this.currentIndex = 0;
    } else {
      this.currentIndex = 1;
    }
  }

  getCurrentValue() {
    let { currentIndex, values } = this;
    return values[currentIndex];
  }

  judge() {
    let { board, values } = this;
    for (let value of values) {
      for (let i = 0; i < SIZE; i ++) {
        for (let j = 0; j < SIZE; j ++) {
          let item = board[i][j];
          if (item === value) {
            // 向下判断
            if (i <= SIZE - 5
              && value === board[i + 1][j]
              && value === board[i + 2][j]
              && value === board[i + 3][j]
              && value === board[i + 4][j]
            ) {
              return value;
            }
            // 向右判断
            if (j <= SIZE - 5
              && value === board[i][j + 1]
              && value === board[i][j + 2]
              && value === board[i][j + 3]
              && value === board[i][j + 4]
            ) {
              return value;
            }
            // 向左下判断
            if (i <= SIZE - 5 && j >= 4
              && value === board[i + 1][j - 1]
              && value === board[i + 2][j - 2]
              && value === board[i + 3][j - 3]
              && value === board[i + 4][j - 4]
            ) {
              return value;
            }
            // 向右下判断
            if (i <= SIZE - 5 && j <= SIZE - 5
              && value === board[i + 1][j + 1]
              && value === board[i + 2][j + 2]
              && value === board[i + 3][j + 3]
              && value === board[i + 4][j + 4]
            ) {
              return value;
            }
          }
        }
      }
    }
    return 0;
  }

  isEnd() {
    let { availables } = this;
    let winner = this.judge();
    let end = false;
    if (winner || !availables.length) {
      end = true;
    }
    return [end, winner];
  }

  copy() {
    return lodash.cloneDeep(this);
  }

  getFeature() {
    let { board, history } = this;
    let feature = matrix.zeros([4, SIZE, SIZE]);
    let currentValue = this.getCurrentValue();
    let step = history.length;
    for (let i = 0; i < SIZE; i ++) {
      for (let j = 0; j < SIZE; j ++) {
        let value = board[i][j];
        if (value === currentValue) {
          feature[0][i][j] = 1;
        } else if (value !== 0) {
          feature[1][i][j] = 1;
        }
        if (step % 2 === 0) {
          feature[3][i][j] = 1;
        }
      }
    }
    if (step !== 0) {
      let location = this.toLocation(lodash.last(history));
      feature[2][location[0]][location[1]] = 1;
    }
    return feature;
  }
}
