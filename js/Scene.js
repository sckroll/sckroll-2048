import { ROW_NUM, COL_NUM } from './config.js';

class Scene {
  constructor() {
    // 점수 등을 표시할 상단 컨테이너 DOM 생성
    const $infoContainer = document.createElement('div');
    $infoContainer.classList.add('info-container');

    // 제목 DOM 생성
    const $title = document.createElement('h1');
    $title.innerText = 'Sckroll 2048';
    $infoContainer.appendChild($title);

    // 점수 DOM 생성
    const $scoreContainer = document.createElement('div');
    const $score = document.createElement('div');
    $scoreContainer.classList.add('score-container');
    $score.classList.add('score');
    $scoreContainer.innerText = 'Score:';
    $score.innerText = '0';
    $scoreContainer.appendChild($score);
    $infoContainer.appendChild($scoreContainer);

    // 하단 컨테이너 DOM 생성
    const $messageContainer = document.createElement('div');
    $messageContainer.classList.add('message-container');

    // 보드 DOM 생성
    const $boardContainer = document.createElement('div');
    const $boardInner = document.createElement('div');
    const $boardBackground = document.createElement('div');
    const $board = document.createElement('div');
    $boardContainer.classList.add('board-container');
    $boardInner.classList.add('board-inner');
    $boardBackground.classList.add('board', 'back');
    $board.classList.add('board', 'front');
    $boardContainer.appendChild($boardInner);
    $boardInner.appendChild($boardBackground);
    $boardInner.appendChild($board);

    // 보드 배경 DOM 생성
    for (let row = 0; row < ROW_NUM; row++) {
      for (let col = 0; col < COL_NUM; col++) {
        const $blockSlot = document.createElement('div');
        $blockSlot.classList.add('block-slot');
        $boardBackground.appendChild($blockSlot);
      }
    }

    // 위에서 생성한 모든 DOM을 루트 DOM($app)에 연결
    this.$app = document.getElementById('app');
    this.$app.appendChild($infoContainer);
    this.$app.appendChild($boardContainer);
    this.$app.appendChild($messageContainer);
  }

  /**
   * 앱의 루트 DOM 객체를 반환하는 함수
   * @returns {HTMLElement} 앱의 루트 DOM
   */
  getContext() {
    return this.$app;
  }

  showOverlay() {
    const $overlay = document.createElement('div');
    $overlay.classList.add('overlay');
    this.$app.appendChild($overlay);
    this.$overlay = $overlay;
  }

  hideOverlay() {
    if (this.$overlay) {
      this.$overlay.remove();
      this.$overlay = null;
    }
  }

  renderIntro() {
    this.showOverlay();

    const $introTitle = document.createElement('h1');
    $introTitle.classList.add('intro-title');
    $introTitle.innerText = 'Sckroll 2048';

    const $startButton = document.createElement('button');
    $startButton.classList.add('start-button');
    $startButton.innerText = 'START'
    $startButton.addEventListener('click', this.hideOverlay());

    const $introContainer = document.createElement('div');
    $introContainer.classList.add('intro-container');
    $introContainer.appendChild($introTitle);
    $introContainer.appendChild($startButton);
    this.$overlay.appendChild($introContainer);
  }
}

export default Scene;
