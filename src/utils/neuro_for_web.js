// for web
import * as tf from '@tensorflow/tfjs';

export default class Neuro {
  constructor() {
    this.model = null;
  }

  async initModel() {
    const file = 'data-model/model.json';
    console.log(process.env.PUBLIC_URL);
    if (process.env.NODE_ENV !== 'production') {
      this.path = `${window.location.origin}/${file}`;
    } else {
      this.path = `${window.location.origin}${process.env.PUBLIC_URL}/${file}`;
    }
    try {
      this.model = await tf.loadLayersModel(this.path);
    } catch (err) {
      console.error('load model error', err);
    }
  }

  // 预测
  predict(game) {
    let feature = game.getFeature();
    let availables = game.availables;
    let [policy, value] = this.model.predict(tf.tensor([feature]))
      .map((output) => (
        output.dataSync()
      ));
    let moveProbs = availables.map(move => [move, policy[move]]);
    return [moveProbs, value];
  }
}
