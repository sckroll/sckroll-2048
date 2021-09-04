import Scene from './scene.js';
import Board from './Board.js';

class App {
  constructor($app) {
    // DOM 및 보드 초기화
    const scene = new Scene($app);
    scene.renderPopup($app, {
      title: 'Sckroll 2048',
      buttonText: 'START'
    }, () => {
      scene.startGame();

      const board = new Board($app);

      // 키보드 이벤트 리스너 등록
      // window.addEventListener('keydown', board.keyboardEventListener); // Error
      // window.addEventListener('keydown', board.keyboardEventListener.bind(board)); // OK
      window.addEventListener('keydown', e => board.keyboardEventListener(e));
  
      // 블록 렌더링
      // board.setTest();
      board.render();
    });
  }
}

export default App;
