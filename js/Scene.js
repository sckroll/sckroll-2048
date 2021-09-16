import Block from './Block.js';
import config from './config.js';
import { isDarkMode } from './utils.js';

/**
 * @typedef {object} MoveData 블록 이동 정보를 나타내는 객체
 * @property {number} prevRow
 * @property {number} prevCol
 * @property {number} nextRow
 * @property {number} nextCol
 * @property {number} prevValue
 * @property {number} nextValue
 * @property {boolean} isCollapsed
 * @property {string} direction
 */

const { ROW_NUM, COL_NUM } = config;

class Scene {
  /**
   * 화면에 나타나는 주요 DOM 객체를 관리하는 클래스
   * @param {HTMLElement} $app - 루트 DOM 객체
   */
  constructor($app) {
    this.$app = $app;

    this.renderMain();
    this.renderBoard();

    // 다크 모드 여부 확인
    if (isDarkMode()) {
      document.documentElement.setAttribute('color-mode', 'dark');
    }
  }

  /**
   * 메인(가운데) 영역을 렌더링하는 메소드
   */
  renderMain() {
    // 메인 컨테이너 DOM
    const $mainContainer = document.createElement('div');
    $mainContainer.classList.add('main-container');
    this.$app.appendChild($mainContainer);
    this.$mainContainer = $mainContainer
  }

  /**
   * 보드 영역을 렌더링하는 메소드
   */
  renderBoard() {
    // 보드 컨테이너 DOM
    const $boardContainer = document.createElement('div');
    $boardContainer.classList.add('board-container');
    this.$mainContainer.appendChild($boardContainer);

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
    this.$board = $board;
  }

  /**
   * 랭킹 영역을 렌더링하는 메소드
   */
  renderRanking() {
    // 랭킹 컨테이너 DOM
    const $rankingContainer = document.createElement('div');
    $rankingContainer.classList.add('ranking-container');
    this.$mainContainer.prepend($rankingContainer);
  }

  /**
   * 블록을 화면에 렌더링하는 메소드
   * @param {Block} block - 생성된 블록 인스턴스
   */
  renderNewBlock(block) {
    const $block = document.createElement('div');
    $block.classList.add('block', `color-${block.value}`, `r${block.row}`, `c${block.col}`);
    $block.innerText = block.value;
    this.$board.appendChild($block);
  }

  /**
   * 블록을 업데이트 후 렌더링하는 메소드
   * @param {MoveData} moveData - 블록의 업데이트 정보가 담긴 객체
   */
  renderUpdatedBlock(moveData) {
    const { prevRow, prevCol, nextRow, nextCol, prevValue, nextValue, isCollapsed } = moveData;
    const $block = this.$board.querySelector(`.r${prevRow}.c${prevCol}`);

    if (isCollapsed) {
      $block.remove();
    } else {
      $block.classList.replace(`r${prevRow}`, `r${nextRow}`);
      $block.classList.replace(`c${prevCol}`, `c${nextCol}`);
      $block.classList.replace(`color-${prevValue}`, `color-${nextValue}`);
      $block.innerText = nextValue;
    }
  }

  /**
   * 팝업 창 오버레이를 렌더링하는 메소드
   */
  showOverlay() {
    const $overlay = document.createElement('div');
    $overlay.classList.add('overlay');
    this.$app.appendChild($overlay);
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
   * @param {{title: string, description: string, buttonText: string}} option - 팝업 창 옵션
   * @param {() => void} onClick - 시작 버튼을 클릭했을 때 실행되는 함수
   */
  renderPopup(option, onClick) {
    // 오버레이 렌더링
    this.showOverlay();

    // 팝업 창 DOM
    const $popupContainer = document.createElement('div');
    $popupContainer.classList.add('popup-container');
    this.$overlay.appendChild($popupContainer);

    // 팝업 제목 컨테이너 DOM
    const $titleContainer = document.createElement('div');
    $titleContainer.classList.add('title-container');
    $popupContainer.appendChild($titleContainer);

    // 제목 DOM
    const $popupTitle = document.createElement('h1');
    $popupTitle.classList.add('popup-title');
    $popupTitle.innerText = option.title;
    $titleContainer.appendChild($popupTitle);

    // 세부 설명 DOM
    if (option.description) {
      const $popupDescription = document.createElement('p');
      $popupDescription.classList.add('popup-description');
      $popupDescription.innerText = option.description;
      $titleContainer.appendChild($popupDescription);
    }
    
    // 버튼 DOM
    const $popupButton = document.createElement('button');
    $popupButton.innerText = option.buttonText;
    $popupButton.addEventListener('click', onClick);
    $popupContainer.appendChild($popupButton);
  }
}

export default Scene;
