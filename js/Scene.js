import Block from './Block.js';
import config from './config.js';

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
  TITLE, 
  TEXT_BUTTON_REPLAY, 
  TEXT_BUTTON_LIGHT, 
  TEXT_BUTTON_DARK,
  TEXT_HIGH_SCORE,
  TEXT_SCORE_TITLE,
  TEXT_SCORE_UNIT,
  TEXT_TURN_TITLE,
  TEXT_TURN_UNIT,
  TEXT_LOG_TITLE,
  LINK_GITHUB,
  LINK_ORIGINAL,
  LINK_DEVELOPER
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
    if (this.isDarkMode()) {
      document.documentElement.setAttribute('color-mode', 'dark');
    }
  }
  
  /**
   * 점수를 포함한 상단 영역을 렌더링하는 메소드
   */
  renderInfo() {
    // 상단 영역 컨테이너 DOM
    const $infoContainer = document.createElement('div');
    $infoContainer.classList.add('info-container');
    this.$app.prepend($infoContainer);

    // 제목 DOM
    const $title = document.createElement('h1');
    $title.innerText = TITLE;
    $infoContainer.appendChild($title);

    // 제목을 제외한 나머지를 감싸는 영역 DOM
    const $infoWrapper = document.createElement('div');
    $infoWrapper.classList.add('info-wrapper');
    $infoContainer.appendChild($infoWrapper);

    // 최고 점수 컨테이너 DOM
    const $highScoreContainer = document.createElement('div');
    $highScoreContainer.classList.add('info');
    $highScoreContainer.innerText = `${TEXT_HIGH_SCORE}:`;
    $infoWrapper.appendChild($highScoreContainer);

    // 최고 점수 DOM
    const $highScore = document.createElement('div');
    $highScore.classList.add('info-value');
    $highScoreContainer.appendChild($highScore);
    this.$highScore = $highScore;

    // 점수 컨테이너 DOM
    const $scoreContainer = document.createElement('div');
    $scoreContainer.classList.add('info');
    $scoreContainer.innerText = `${TEXT_SCORE_TITLE}:`;
    $infoWrapper.appendChild($scoreContainer);

    // 점수 DOM
    const $score = document.createElement('div');
    $score.classList.add('info-value');
    $scoreContainer.appendChild($score);
    this.$score = $score;

    // 턴 컨테이너 DOM
    const $turnContainer = document.createElement('div');
    $turnContainer.classList.add('info');
    $turnContainer.innerText = `${TEXT_TURN_TITLE}:`;
    $infoWrapper.appendChild($turnContainer);

    // 턴 DOM
    const $turn = document.createElement('div');
    $turn.classList.add('info-value');
    $turnContainer.appendChild($turn);
    this.$turn = $turn;
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
   * 게임 설정을 관리하는 하단 영역을 렌더링하는 메소드
   */
  renderActions() {
    // 하단 영역 컨테이너 DOM
    const $ActionsContainer = document.createElement('div');
    $ActionsContainer.classList.add('actions-container');
    this.$app.appendChild($ActionsContainer);

    // 버튼 영역 DOM
    const $buttonArea = document.createElement('div');
    $buttonArea.classList.add('button-area');
    $ActionsContainer.appendChild($buttonArea);

    // 재시작 버튼 DOM
    const $replayButton = document.createElement('button');
    $replayButton.classList.add('width-fixed');
    $replayButton.innerText = TEXT_BUTTON_REPLAY;
    $replayButton.addEventListener('click', this.onReplay);
    $buttonArea.appendChild($replayButton);

    // 링크 버튼 컨테이너 DOM
    const $linkContainer = document.createElement('a');
    $linkContainer.classList.add('link-container');
    $linkContainer.href = LINK_GITHUB;
    $buttonArea.appendChild($linkContainer);

    // GitHub 링크 버튼 DOM
    const $githubButton = document.createElement('span');
    $githubButton.classList.add('link-icon', 'fab', 'fa-github');
    $linkContainer.appendChild($githubButton);

    // 다크 모드 버튼 DOM
    const $darkModeButton = document.createElement('button');
    $darkModeButton.classList.add('width-fixed');
    if (this.isDarkMode()) {
      document.documentElement.setAttribute('color-mode', 'dark');
      $darkModeButton.classList.add('dark');
      $darkModeButton.innerText = TEXT_BUTTON_LIGHT;
    } else {
      $darkModeButton.innerText = TEXT_BUTTON_DARK;
    }
    $darkModeButton.addEventListener('click', e => this.toggleColorMode(e));
    $buttonArea.appendChild($darkModeButton);
    this.$darkModeButton = $darkModeButton

    // 제작자 정보 영역 DOM
    const $authorArea = document.createElement('div');
    const $original = document.createElement('div');
    const $developer = document.createElement('div');
    $authorArea.classList.add('author-area');
    $original.innerHTML = `Inspired by <a href="${LINK_ORIGINAL}">Gabriele Cirulli\'s 2048</a>`;
    $developer.innerHTML = `Developed by <a href="${LINK_DEVELOPER}">Sckroll</a>`;
    $authorArea.appendChild($original);
    $authorArea.appendChild($developer);
    $ActionsContainer.appendChild($authorArea);
  }

  /**
   * 점수를 렌더링하는 메소드
   * @param {Number} score - 현재 점수
   */
  renderScore(score) {
    this.$score.innerText = score;
  }

  /**
   * 최고 점수를 렌더링하는 메소드
   * @param {Number} highScore - 현재 최고 점수
   */
  renderHighScore(highScore) {
    this.$highScore.innerText = highScore;
  }

  /**
   * 현재 턴을 렌더링하는 메소드
   * @param {Number} turn - 현재 턴
   */
  renderTurn(turn) {
    this.$turn.innerText = turn;
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
   * 재시작 버튼을 클릭했을 때 호출하는 함수를 설정하는 메소드
   * @param {() => void} onReplay - 재시작 버튼 클릭 시 호출하는 이벤트 함수
   */
  setReplayEvent(onReplay) {
    this.onReplay = onReplay;
  }

  /**
   * 현재 다크 모드 적용 여부를 반환하는 메소드
   * @returns {boolean} 다크 모드 여부
   */
  isDarkMode() {
    const { matches } = window.matchMedia('(prefers-color-scheme: dark)');
    
    // 로컬 스토리지 -> OS 설정값 순으로 판단
    const isStorageValueDark = localStorage.getItem('2048-color-mode') === 'dark';
    const isOSValueDark = matches && !localStorage.getItem('2048-color-mode');
    return isStorageValueDark || isOSValueDark;
  }

  /**
   * 다크 모드 여부를 토글하는 메소드
   * @param {MouseEvent} event - 마우스 클릭 이벤트
   */
  toggleColorMode({ target }) {
    if (target.classList.contains('dark')) {
      // 다크 모드 -> 라이트 모드
      document.documentElement.setAttribute('color-mode', 'light');
      localStorage.setItem('2048-color-mode', 'light');
      this.$darkModeButton.innerText = TEXT_BUTTON_DARK;
    } else {
      // 라이트 모드 -> 다크 모드
      document.documentElement.setAttribute('color-mode', 'dark');
      localStorage.setItem('2048-color-mode', 'dark');
      this.$darkModeButton.innerText = TEXT_BUTTON_LIGHT;
    }
    target.classList.toggle('dark');
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
