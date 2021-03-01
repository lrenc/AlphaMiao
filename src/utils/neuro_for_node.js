// for node
import * as tf from '@tensorflow/tfjs-node';
import { SIZE } from './constants';

export default class Neuro {
  constructor() {
    this.model = null;
  }

  async initModel() {
    this.path = `./models/data-model`;
    try {
      this.model = await tf.loadLayersModel(`file://${this.path}/model.json`);
    } catch (err) {
      // 创建新model
      console.log('NOTICE: model not exist, create a new one.');

      const config = { l2: 1e-4 };

      const input = tf.input({
        shape: [4, SIZE, SIZE],
        name: 'inputLayer'
      });

      // 3层公共卷积层
      const conv1 = tf.layers.conv2d({
        filters: 32,
        kernelSize: [3, 3],
        padding: 'same',
        dataFormat: 'channelsFirst',
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2(config)
      }).apply(input);

      const conv2 = tf.layers.conv2d({
        filters: 64,
        kernelSize: [3, 3],
        padding: 'same',
        dataFormat: 'channelsFirst',
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2(config)
      }).apply(conv1);

      const conv3 = tf.layers.conv2d({
        filters: 128,
        kernelSize: [3, 3],
        padding: 'same',
        dataFormat: 'channelsFirst',
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2(config)
      }).apply(conv2);

      // 转换成4层结构
      const conv4 = tf.layers.conv2d({
        filters: 4,
        kernelSize: [1, 1],
        padding: 'same',
        dataFormat: 'channelsFirst',
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2(config)
      }).apply(conv3);

      const conv5 = tf.layers.reshape({
        targetShape: [4 * SIZE * SIZE]
      }).apply(conv4);

      // 策略网络输出
      const conv6 = tf.layers.dense({
        units: SIZE * SIZE,
        activation: 'softmax',
        name: 'policyOutputLayer',
        kernelRegularizer: tf.regularizers.l2(config)
      }).apply(conv5);

      const conv7 = tf.layers.conv2d({
        filters: 2,
        kernelSize: [1, 1],
        padding: 'same',
        dataFormat: 'channelsFirst',
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2(config)
      }).apply(conv3);

      const conv8 = tf.layers.reshape({
        targetShape: [2 * SIZE * SIZE]
      }).apply(conv7);

      const conv9 = tf.layers.dense({
        units: SIZE * SIZE,
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2(config)
      }).apply(conv8);

      // 价值网络输出
      const conv10 = tf.layers.dense({
        units: 1,
        activation: 'tanh',
        name: 'valueOutputLayer',
        kernelRegularizer: tf.regularizers.l2(config)
      }).apply(conv9);

      this.model = tf.model({
        inputs: input,
        outputs: [conv6, conv10]
      });
    }

    this.model.compile({
      optimizer: tf.train.adam(), // 优化器
      loss: [
        'categoricalCrossentropy',
        'meanSquaredError'
      ]
    });
    this.model.summary();
  }

  async saveModel() {
    try {
      await this.model.save(`file://${this.path}`);
    } catch (err) {
      console.log('ERROR: save model error', err);
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

  // 训练
  async train(states, probs, values) {
    let labels = [
      tf.tensor(probs),
      tf.tensor(values)
    ];
    let xs = tf.tensor(states);
    await this.model.fit(xs, labels, {
      batchSize: 512,
      epochs: 3,
      callbacks: {
        onEpochEnd: async (epoch, logs) => {
          console.log('ephch end', logs);
          await this.saveModel();
        }
      }
    });
  }
}
