/**
 * 蒙特卡洛树搜索
 */

import softmax from './softmax';
import lodash from 'lodash';
import random from './random';

export class TreeNode {
  constructor(parent, prior) {
    this.parent = parent;
    this.children = {};
    this.visits = 0;
    this.P = prior;
    this.Q = 0;
    this.u = 0; // 探索分
  }

  // 扩展
  expand(actionPriors) {
    for (let [ action, prob ] of actionPriors) {
      if (!(action in this.children)) {
        this.children[action] = new TreeNode(this, prob);
      }
    }
  }

  // 选择 Q + u 最大的子节点
  select(puct) {
    let max = lodash.maxBy(Object.entries(this.children), (item) => {
      return item[1].getValue(puct);
    });
    return max;
  }

  update(value) {
    this.visits += 1;
    this.Q += (value - this.Q) / this.visits;
  }

  // 更新整个路径
  updatePath(value) {
    if (this.parent) {
      this.parent.updatePath(-value);
    }
    this.update(value);
  }

  getValue(puct) {
    this.u = puct * this.P * Math.sqrt(this.parent.visits) / (this.visits + 1);
    return this.Q + this.u;
  }

  // 是否是叶子节点
  isLeaf() {
    return Object.keys(this.children).length === 0;
  }

  isRoot() {
    return this.parent === null;
  }
}

export default class MCTS {
  constructor(neuro, playoutCount) {
    this.root = new TreeNode(null, 1);
    this.neuro = neuro;
    this.puct = 5;
    this.playoutCount = playoutCount;
  }

  upgrade(playoutCount) {
    this.playoutCount = playoutCount;
  }
  // 一次完整的蒙特卡洛树搜索过程
  playout(state) {
    let node = this.root;
    while (true) {
      if (node.isLeaf()) {
        break;
      }
      let move;
      ([move, node] = node.select(this.puct));
      state.action(lodash.toNumber(move));
    }
    // 获取神经网络输出
    let [moveProbs, value] = this.neuro.predict(state);
    // console.log(moveProbs, value);
    let [end, winner] = state.isEnd();
    if (!end) {
      node.expand(moveProbs);
    } else {
      // game over
      if (winner === 0) {
        value = 0;
      } else {
        let currentValue = state.getCurrentValue();
        value = (winner === currentValue ? 1 : -1);
      }
    }
    node.updatePath(-value);
  }

  divination(state) {
    for (let i = 0; i < this.playoutCount; i ++) {
      let copyState = state.copy();
      this.playout(copyState);
    }
    // 取出action和对应的访问次数的概率
    let moveVisits = [];
    let { children } = this.root;
    for (let move of Object.keys(children)) {
      let node = children[move];
      moveVisits.push([move, node.visits]);
    }
    let [moves, visits] = lodash.unzip(moveVisits);
    let probs = softmax(visits);
    return [moves, probs];
  }

  // 随着游戏的进行，不断更新搜索树
  updateForward(lastAction) {
    if (lastAction in this.root.children) {
      this.root = this.root.children[lastAction];
      this.root.parent = null;
    } else {
      this.root = new TreeNode(null, 1);
    }
  }
}
