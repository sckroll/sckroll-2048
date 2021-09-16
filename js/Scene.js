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

const { 
  ROW_NUM, 
  COL_NUM, 
  TEXT_SCORE_UNIT,
  TEXT_TURN_UNIT,
  TEXT_LOG_TITLE,
} = config;

class Scene {
  /**
   * 화면에 나타나는 DOM 객체를 관리하는 클래스
   * @param {HTMLElement} $app - 루트 DOM 객체
   */
  constructor($app) {
    this.$app = $app
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
   * 로그 영역을 렌더링하는 메소드
   */
  renderLog() {
    // 로그 컨테이너 DOM
    const $logContainer = document.createElement('div');
    $logContainer.classList.add('log-container');
    this.$mainContainer.appendChild($logContainer);
    this.$logContainer = $logContainer;

    // 로그 토글 버튼 DOM
    const $logToggleButton = document.createElement('div');
    $logToggleButton.classList.add('log-toggle-button');
    $logToggleButton.innerHTML = `${TEXT_LOG_TITLE} <i class="fas fa-chevron-down"></i>`;
    $logContainer.appendChild($logToggleButton);
    
    // 로그 영역 DOM
    const $logContent = document.createElement('div');
    $logContent.classList.add('log-content');
    $logToggleButton.addEventListener('click', () => this.toggleLogVisibility());
    this.$logContent = $logContent;

    // 토글 표시 여부 확인
    if (localStorage.getItem('2048-log')) {
      $logContainer.appendChild($logContent);
    }
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
   * 블록 이동 정보를 로그에 기록하는 메소드
   * @param {string | null} message - 블록 이동 정보 대신에 표시할 메시지
   * @param {MoveData[]} [moveDataList] - 블록의 업데이트 정보가 담긴 객체
   * @param {number} [turn] - 현재 턴
   * @param {number[][]} [prevState] - 이전 턴의 블록 위치를 저장한 2차원 배열
   */
  addToLog(message, moveDataList, turn, prevState) {
    const $newLog = document.createElement('div');
    $newLog.classList.add('log-item');
    
    if (message) {
      const $message = document.createElement('div');
      $message.classList.add('message')
      $message.innerText = message;
      $newLog.appendChild($message);
    } else {
      // 이동 방향 추출 및 이전 턴에서 얻은 점수를 합산
      let addedScore = 0;
      let dir;
      for (const moveData of moveDataList) {
        const { prevValue, nextValue, direction } = moveData;
        addedScore += (nextValue - prevValue) * 2;
        dir = direction;
      }

      // 방향 아이콘 DOM
      const $direction = document.createElement('i');
      $direction.classList.add('direction', 'fas', `fa-arrow-${dir.toLowerCase()}`);

      // 이전 턴 DOM
      const $turn = document.createElement('div');
      $turn.classList.add('turn');
      $turn.innerText = `${turn}${TEXT_TURN_UNIT}`;

      // 획득 점수 DOM
      const $score = document.createElement('div');
      $score.classList.add('score');
      $score.innerText = `+${addedScore}${TEXT_SCORE_UNIT}`;

      // 이전 위치 툴팁 아이콘 컨테이너 DOM
      const $position = document.createElement('div');
      $position.classList.add('position');

      // 이전 위치 툴팁 아이콘 DOM
      const $posIcon = document.createElement('i');
      $posIcon.classList.add('fas', 'fa-th');

      // 이전 위치 툴팁 오버레이 DOM
      const $posOverlay = document.createElement('div');
      $posOverlay.classList.add('position-overlay');

      // 이전 턴의 블록 위치를 보여주는 툴팁 구현
      const $tooltipContainer = document.createElement('div');
      $tooltipContainer.classList.add('tooltip-container');

      // 툴팁 아이콘에 마우스를 올릴 때 툴팁이 나타나는 이벤트 처리
      $posOverlay.addEventListener('mouseover', ({ target }) => {
        $position.appendChild($tooltipContainer);

        const $prevBoard = document.createElement('div');
        $prevBoard.classList.add('prev-board');
        $tooltipContainer.appendChild($prevBoard);

        // data-prevPos 속성에 저장된 값을 불러와 2차원 배열로 변환 후 사용
        const prevState = JSON.parse(target.dataset.prevPos);
        for (let i = 0; i < ROW_NUM; i++) {
          for (let j = 0; j < COL_NUM; j++) {
            const $prevBlock = document.createElement('div');
            $prevBlock.classList.add('prev-block', `color-${prevState[i][j]}`);
            $prevBlock.innerText = prevState[i][j];
            $prevBoard.appendChild($prevBlock);
          }
        }
      })

      // 툴팁 아이콘에서 마우스를 뗐을 때 툴팁이 사라지는 이벤트 처리
      $posOverlay.addEventListener('mouseleave', () => {
        if ($position.querySelector('.tooltip-container')) {
          while ($tooltipContainer.hasChildNodes()) {
            $tooltipContainer.removeChild($tooltipContainer.lastChild);
          }
          $tooltipContainer.remove();
        }
      })

      // 이전 턴의 블록 위치를 요소에 저장
      $posOverlay.dataset.prevPos = JSON.stringify(prevState);

      // DOM 연결
      $position.appendChild($posIcon);
      $position.appendChild($posOverlay);
      $newLog.appendChild($direction);
      $newLog.appendChild($turn);
      $newLog.appendChild($score);
      $newLog.appendChild($position);
    }
    
    this.$logContent.prepend($newLog);
  }

  /**
   * 로그를 비우는 메소드
   */
  clearLog() {
    while (this.$logContent.hasChildNodes()) {
      this.$logContent.removeChild(this.$logContent.lastChild);
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

  /**
   * 로그 화면 표시 여부를 토글하는 메소드
   */
  toggleLogVisibility() {
    if (this.$logContainer.lastChild === this.$logContent) {
      this.$logContent.remove();
      localStorage.removeItem('2048-log');
    } else {
      this.$logContainer.appendChild(this.$logContent);
      localStorage.setItem('2048-log', 'true');
    }
  }
}

export default Scene;
