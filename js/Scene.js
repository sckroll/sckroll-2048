import { ROW_NUM, COL_NUM } from './config.js';

class Scene {
  constructor($app) {
    this.renderInfo($app);
    this.renderBoard($app);
    this.renderActions($app);
  }
  
  /**
   * 점수를 포함한 상단 영역을 렌더링하는 메소드
   * @param {HTMLElement} $app - 루트 DOM 객체
   */
  renderInfo($app) {
    // 상단 영역 컨테이너 DOM
    const $infoContainer = document.createElement('div');
    $infoContainer.classList.add('info-container');
    $app.appendChild($infoContainer);

    // 제목 DOM
    const $title = document.createElement('h1');
    $title.innerText = 'Sckroll 2048';
    $infoContainer.appendChild($title);

    // 점수 컨테이너 DOM
    const $scoreContainer = document.createElement('div');
    $scoreContainer.classList.add('score-container');
    $scoreContainer.innerText = 'Score:';
    $infoContainer.appendChild($scoreContainer);

    // 점수 DOM
    const $score = document.createElement('div');
    $score.classList.add('score');
    $score.innerText = '0';
    $scoreContainer.appendChild($score);
  }

  /**
   * 보드 영역을 렌더링하는 메소드
   * @param {HTMLElement} $app - 루트 DOM 객체
   */
  renderBoard($app) {
    // 보드 컨테이너 DOM
    const $boardContainer = document.createElement('div');
    $boardContainer.classList.add('board-container');
    $app.appendChild($boardContainer);

    // 보드 내부 영역 DOM
    const $boardInner = document.createElement('div');
    $boardInner.classList.add('board-inner');
    $boardContainer.appendChild($boardInner);

    // 보드 배경 DOM
    const $boardBackground = document.createElement('div');
    $boardBackground.classList.add('board', 'back');
    $boardInner.appendChild($boardBackground);
    for (let row = 0; row < ROW_NUM; row++) {
      for (let col = 0; col < COL_NUM; col++) {
        const $blockSlot = document.createElement('div');
        $blockSlot.classList.add('block-slot');
        $boardBackground.appendChild($blockSlot);
      }
    }

    // 보드 앞부분 DOM
    const $board = document.createElement('div');
    $board.classList.add('board', 'front');
    $boardInner.appendChild($board);
  }

  /**
   * 게임 설정을 관리하는 하단 영역을 렌더링하는 메소드
   * @param {HTMLElement} $app - 루트 DOM 객체
   */
  renderActions($app) {
    const $ActionsContainer = document.createElement('div');
    $ActionsContainer.classList.add('message-container');
    $app.appendChild($ActionsContainer);
  }

  /**
   * 팝업 창 오버레이를 렌더링하는 메소드
   * @param {HTMLElement} $app - 루트 DOM 객체
   */
  showOverlay($app) {
    const $overlay = document.createElement('div');
    $overlay.classList.add('overlay');
    $app.appendChild($overlay);
    this.$overlay = $overlay;
  }

  /**
   * 팝업 창과 팝업 창 오버레이를 숨기는 메소드
   */
  hideOverlay() {
    if (this.$overlay) {
      this.$overlay.remove();
      this.$overlay = null;
    }
  }

  /**
   * 팝업 창을 렌더링하는 메소드
   * @param {HTMLElement} $app - 루트 DOM 객체
   * @param {{title: string, buttonText: string}} option - 팝업 창 옵션
   * @param {function():void} onClick - 시작 버튼을 클릭했을 때 실행되는 함수
   */
  renderPopup($app, option, onClick) {
    // 오버레이 렌더링
    this.showOverlay($app);

    // 게임 시작 팝업 DOM
    const $popupContainer = document.createElement('div');
    $popupContainer.classList.add('popup-container');
    this.$overlay.appendChild($popupContainer);
    
    // 타이틀 DOM
    const $popupTitle = document.createElement('h1');
    $popupTitle.classList.add('popup-title');
    $popupTitle.innerText = option.title;
    $popupContainer.appendChild($popupTitle);
    
    // 버튼 DOM
    const $popupButton = document.createElement('button');
    $popupButton.innerText = option.buttonText;
    $popupButton.addEventListener('click', onClick);
    $popupContainer.appendChild($popupButton);
  }

  /**
   * 팝업 창과 팝업 창 오버레이를 숨기고 게임을 시작하는 메소드
   */
  startGame() {
    this.hideOverlay();
  }
}

export default Scene;
