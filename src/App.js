import React from 'react';
import { flatten } from 'lodash';
import classnames from 'classnames';
import './App.css';
import Game from './utils/game';
import AI from './utils/ai';
import Human from './utils/human';
import { dispatch, listen } from './utils/event';
import { SIZE } from './utils/constants';

class App extends React.Component {
  constructor(props) {
    super();
    this.game = new Game();
    this.state = {
      board: this.game.board,
      overlay: true
    };
    listen('play', () => {
      this.setState({
        board: this.game.board
      });
    });

    listen('end', (winner) => {
      setTimeout(() => {
        alert(winner);
      });
    });
  }

  onStart = (value) => async () => {
    this.setState({
      overlay: false
    });
    let human = new Human();
    let ai = new AI();
    await ai.init();
    this.game.start([human, ai], value);
  }

  onMove = (e) => {
    if (this.game.currentIndex !== 0) {
      return;
    }
    const { value } = e.target.dataset;
    dispatch('action', value);
    console.log(value);
  }

  render() {
    const { board, overlay } = this.state;
    return (
      <>
        <p style={{textAlign: 'center'}}>AI每次落子前都会执行一定量的运算，请耐心等候。</p>
        <p style={{textAlign: 'center'}}>当前AI棋力仅为自我对局2000局左右，任有很大的提升空间。</p>
        <div
          className="game"
          style={{width: SIZE * 45 + 1}}
        >
          {flatten(board).map((item, index) => (
            <div
              className="game-cell"
              key={index}
            >
              <div
                className={classnames('game-point', {
                white: item === 1,
                black: item === 2
              })}
                data-value={index}
                onClick={this.onMove}
              />
            </div>
          ))}
          <div
            className="overlay"
            style={{display: overlay ? 'flex' : 'none'}}
          >
            <button
              className="btn"
              onClick={this.onStart(0)}
            >
              我先手
            </button>
            <button
              className="btn"
              onClick={this.onStart(1)}
            >
              AI先手
            </button>
          </div>
        </div>
      </>
    );
  }
}

export default App;
