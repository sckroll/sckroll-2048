import config from './config.js';

const {
  ROW_NUM,
  COL_NUM,
  TEXT_SCORE_UNIT,
  TEXT_TURN_UNIT,
  TEXT_LOG_TITLE,
} = config;

class Log {
  /**
   * 상단 정보 컨테이너를 관리하는 클래스
   * @param {HTMLElement} $app - 루트 DOM 객체
   * @param {HTMLDivElement} $mainContainer - 메인(가운데) 컨테이너 DOM 객체
   */
  constructor($app, $mainContainer) {
    this.$app = $app;
    this.$mainContainer = $mainContainer;

    this.init();
  }

  /**
   * 로그 영역을 초기화하는 메소드
   */
  init() {
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
   * 블록 이동 정보를 로그에 기록하는 메소드
   * @param {string | null} message - 블록 이동 정보 대신에 표시할 메시지
   * @param {MoveData[]} [moveDataList] - 블록의 업데이트 정보가 담긴 객체
   * @param {number} [turn] - 현재 턴
   * @param {number[][]} [prevState] - 이전 턴의 블록 위치를 저장한 2차원 배열
   */
  add(message, moveDataList, turn, prevState) {
    const $newLog = document.createElement('div');
    $newLog.classList.add('log-item');

    if (message) {
      // 메시지가 있다면 블록 이동 정보 대신 메시지를 로그에 출력
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

export default Log;
