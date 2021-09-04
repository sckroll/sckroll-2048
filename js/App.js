import Scene from './scene.js';
import Board from './Board.js';

class App {
  constructor() {
    // DOM 및 보드 초기화
    const scene = new Scene();
    // scene.renderIntro();
    const $app = scene.getContext();
    const board = new Board($app);

    // 키보드 이벤트 리스너 등록
    // window.addEventListener('keydown', board.keyboardEventListener); // Error
    window.addEventListener('keydown', board.keyboardEventListener.bind(board));

    // 블록 렌더링
    // board.setTest();
    board.render();
  }
}

export default App;
