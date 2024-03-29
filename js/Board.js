import Block from './Block.js';
import config from './config.js';
import { swapRowsCols, reverseRowElements, objectMapper, copyMatrix } from './utils.js';

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

const { ROW_NUM, COL_NUM, SLIDE_THRESHOLD, KEY_HIGH_SCORE } = config;

/**
 * 배열 형식의 블록 이동 정보를 객체 타입으로 변환하는 함수
 * @param {any[]} data - 객체에 매핑시킬 값을 저장한 배열
 * @returns {object} 각 키와 값이 매핑된 객체
 */
const getMoveDataObject = data => {
  const moveDataKeys = ['prevRow', 'prevCol', 'nextRow', 'nextCol', 'prevValue', 'nextValue', 'isCollapsed', 'direction'];
  return objectMapper(moveDataKeys, data);
}

class Board {
  /**
   * 보드를 관리하는 클래스
   * @param {HTMLElement} $app - 루트 DOM 객체
   */
  constructor($app) {
    this.$app = $app;
    this.$board = $app.querySelector('.board.front');

    this.state = [];
    this.prevState = [];
    this.emptyPos = [];
    this.blockMoveData = [];

    this.score = 0;
    this.turn = 1;
    this.largestNum = 0;
    
    this.gameStopped = false;
    this.gameContinued = false;
    this.pressed = false;
    
    this.sourceX = -1;
    this.sourceY = -1;
    this.targetX = -1;
    this.targetY = -1;

    this.highScore =  this.getHighScore();
    this.render();
    this.initPosition();
  }

  /**
   * 보드 영역을 렌더링하는 메소드
   */
  render() {
    // 보드 컨테이너 DOM
    const $boardContainer = document.createElement('div');
    $boardContainer.classList.add('board-container');
    this.$app.appendChild($boardContainer);

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
   * 보드 내 블록 위치를 나타내는 배열과 비어있는 블록 위치를 저장하는 배열을 초기화하는 메소드
   */
  initPosition() {
    for (let row = 0; row < ROW_NUM; row++) {
      this.state.push([]);
      for (let col = 0; col < COL_NUM; col++) {
        this.state[row].push(0);
        this.emptyPos.push(`${row}${col}`);
      }
    }
  }

  /**
   * 새 블록을 생성하는 메소드
   * @param {number} [value] - 블록의 값 (생략하면 2 혹은 4로 초기화)
   */
  createBlock(value) {
    new Block(this.$board, this.state, this.emptyPos, value);
  }

  /**
   * 로그를 업데이트했을 때 호출하는 함수를 설정하는 메소드
   * @param {(message: string | null, moveDataList: MoveData[], turn: number, prevState: number[][]) => void} onLogUpdate - 로그를 업데이트했을 때 호출하는 이벤트 함수
   */
  setUpdateLogEvent(onLogUpdate) {
    this.onLogUpdate = onLogUpdate;
  }

  /**
   * 게임에서 승리했을 때 호출하는 함수를 설정하는 메소드
   * @param {() => void} onGameClear - 승리했을 때 호출하는 이벤트 함수
   */
  setGameClearEvent(onGameClear) {
    this.onGameClear = onGameClear;
  }

  /**
   * 게임에서 패배했을 때 호출하는 함수를 설정하는 메소드
   * @param {() => void} onGameOver - 게임 오버 시 호출하는 이벤트 함수
   */
  setGameOverEvent(onGameOver) {
    this.onGameOver = onGameOver;
  }

  /**
   * 점수를 갱신할 때 호출하는 함수를 설정하는 메소드
   * @param {(score: number) => void} onScoreUpdate - 점수 업데이트 시 호출하는 이벤트 함수
   */
  setScoreUpdateEvent(onScoreUpdate) {
    this.onScoreUpdate = onScoreUpdate;
  }

  /**
   * 현재 턴을 갱신할 때 호출하는 함수를 설정하는 메소드
   * @param {(turn: number) => void} onTurnUpdate - 현재 턴 업데이트 시 호출하는 이벤트 함수
   */
  setTurnUpdateEvent(onTurnUpdate) {
    this.onTurnUpdate = onTurnUpdate;
  }

  /**
   * 최고 점수를 갱신할 때 호출되는 함수를 설정하는 메소드
   * @param {(highScore: number) => void} onHighScoreUpdate - 최고 점수 업데이트 시 호출하는 이벤트 함수 
   */
  setHighScoreUpdateEvent(onHighScoreUpdate) {
    this.onHighScoreUpdate = onHighScoreUpdate;
  }

  /**
   * 기록을 경신했을 때 최고 점수를 설정하는 메소드
   * @param {number} score - 새로운 최고 점수
   */
  setHighScore(score) {
    localStorage.setItem(KEY_HIGH_SCORE, score);
  }

  /**
   * 최고 점수를 불러오는 메소드
   * @returns {number} 현재 최고 점수
   */
  getHighScore() {
    const highScore = localStorage.getItem(KEY_HIGH_SCORE) || 0;
    return highScore;
  }

  /**
   * 승리 조건(2048 완성)을 만족했는지 검사하는 메소드
   * @returns {boolean} 승리 조건 만족 여부
   */
  isGameClear() {
    return this.largestNum === 2048;
  }

  /**
   * 패배 조건(모든 블록으로 채워짐 & 4방향으로 모두 움직일 수 없음)을 만족하는지 검사하는 메소드
   * @returns {boolean} 패배 조건 만족(게임 오버) 여부
   */
  isGameOver() {
    if (this.emptyPos.length > 0) return false;

    for (let row = 0; row < ROW_NUM; row++) {
      for (let col = 0; col < COL_NUM - 1; col++) {
        if (this.state[row][col] === this.state[row][col + 1]) {
          return false;
        }
      }
    }
    for (let col = 0; col < ROW_NUM; col++) {
      for (let row = 0; row < COL_NUM - 1; row++) {
        if (this.state[row][col] === this.state[row + 1][col]) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * 블록을 컨트롤 할 수 있는지 여부를 반환하는 메소드
   * @returns {boolean} 블록 막힘 여부
   */
  isStuck() {
    return this.blockMoveData.length === 0;
  }

  /**
   * 블록 이동 후 업데이트를 수행하는 메소드
   */
  update() {
    for (let data of this.blockMoveData) {
      // 화면에 표시되는 블록을 업데이트
      this.renderUpdatedBlock(data);

      const { prevRow, prevCol, nextRow, nextCol, nextValue, isCollapsed } = data;

      if (isCollapsed) {
        // 점수 획득
        this.score += nextValue * 2;
        this.onScoreUpdate(this.score);

        // 최고 점수를 경신했다면 최고 점수 업데이트
        if (this.score > this.highScore) {
          this.highScore = this.score;
          this.onHighScoreUpdate(this.highScore);
        }
      } else {
        const nextPosIdx = this.emptyPos.findIndex(pos => pos === `${nextRow}${nextCol}`);
        this.emptyPos.splice(nextPosIdx, 1);
      }
      this.emptyPos.push(`${prevRow}${prevCol}`);
    }

    // 로그 업데이트
    this.onLogUpdate(null, this.blockMoveData, this.turn, this.prevState);

    // 블록 이동 정보 초기화
    this.blockMoveData = [];

    // 다음 턴으로
    this.turn += 1;
    this.onTurnUpdate(this.turn);
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
   * 이동 후의 현재 행에 대해 좌표 정보를 계산하는 메소드
   * @param {number[]} arr - 변형된 행렬의 현재 행을 저장한 배열
   * @param {number} idx - 현재 행의 위치를 나타내는 인덱스
   * @param {string} direction - 이동 방향
   * @returns {MoveData[]} 현재 행에서의 블록의 이동 정보를 담은 배열
   */
  getAfterMoveData(arr, idx, direction) {
    const moveData = [];

    // i: 기준
    for (let i = arr.length - 1; i > 0; i--) {
      // j: 검사 대상
      for (let j = i - 1; j >= 0; j--) {
        if (arr[j] === 0) {
          // 검사 대상이 0이면 다음 검사 대상으로
          continue;
        } else if (arr[j] === arr[i]) {
          // 검사 대상이 기준 값과 같으면 검사 대상 값을 0으로, 기준 값을 2배로, 기준을 왼쪽으로 이동
          arr[j] = 0;
          arr[i] *= 2;

          let removedData, newData;
          if (direction === 'Up') {
            removedData = getMoveDataObject([ROW_NUM - 1 - i, idx, ROW_NUM - 1 - i, idx, arr[i] / 2, arr[i] / 2, true, direction]);
            newData = getMoveDataObject([ROW_NUM - 1 - j, idx, ROW_NUM - 1 - i, idx, arr[i] / 2, arr[i], false, direction]);
          } else if (direction === 'Down') {
            removedData = getMoveDataObject([i, idx, i, idx, arr[i] / 2, arr[i] / 2, true, direction]);
            newData = getMoveDataObject([j, idx, i, idx, arr[i] / 2, arr[i], false, direction]);
          } else if (direction === 'Left') {
            removedData = getMoveDataObject([idx, ROW_NUM - 1 - i, idx, ROW_NUM - 1 - i, arr[i] / 2, arr[i] / 2, true, direction]);
            newData = getMoveDataObject([idx, ROW_NUM - 1 - j, idx, ROW_NUM - 1 - i, arr[i] / 2, arr[i], false, direction]);
          } else if (direction === 'Right') {
            removedData = getMoveDataObject([idx, i, idx, i, arr[i] / 2, arr[i] / 2, true, direction]);
            newData = getMoveDataObject([idx, j, idx, i, arr[i] / 2, arr[i], false, direction]);
          }
          moveData.push(removedData);
          moveData.push(newData);

          // 현재 가장 높은 숫자인지 검사
          this.largestNum = Math.max(this.largestNum, arr[i]);

          break;
        } else {
          // 검사 대상이 그 외의 값이면
          if (arr[i] === 0) {
            // 기준이 0이면 기준 값과 검사 대상 값을 스왑 후 다음 검사 대상으로
            const temp = arr[j];
            arr[j] = arr[i];
            arr[i] = temp;

            let newData;
            if (direction === 'Up') {
              newData = getMoveDataObject([ROW_NUM - 1 - j, idx, ROW_NUM - 1 - i, idx, arr[i], arr[i], false, direction]);
            } else if (direction === 'Down') {
              newData = getMoveDataObject([j, idx, i, idx, arr[i], arr[i], false, direction]);
            } else if (direction === 'Left') {
              newData = getMoveDataObject([idx, ROW_NUM - 1 - j, idx, ROW_NUM - 1 - i, arr[i], arr[i], false, direction]);
            } else if (direction === 'Right') {
              newData = getMoveDataObject([idx, j, idx, i, arr[i], arr[i], false, direction]);
            }
            moveData.push(newData);
          } else {
            // 기준을 왼쪽으로 이동
            break;
          }
        }
      }
    }

    return moveData;
  }

  /**
   * 블록의 실제 이동을 처리하는 메소드
   * @param {string} key - 키보드 이벤트 객체의 key 속성(`e.key`)에 해당하는 문자열
   */
  moveBlock(key) {
    const dir = key.replace('Arrow', '');

    // 방향에 따라 행렬을 변형
    let currBoard;
    if (dir === 'Up') {
      const swappedBoard = swapRowsCols(this.state);
      currBoard = reverseRowElements(swappedBoard);
    } else if (dir === 'Down') {
      currBoard = swapRowsCols(this.state);
    } else if (dir === 'Left') {
      currBoard = reverseRowElements(this.state);
    } else if (dir === 'Right') {
      currBoard = this.state;
    }

    // 변형된 배열의 각 행에 대해 이동 후 좌표를 계산
    for (let row = 0; row < currBoard.length; row++) {
      const moveData = this.getAfterMoveData(currBoard[row], row, dir);
      if (moveData.length > 0) {
        this.blockMoveData.push(...moveData);
      }
    }

    // 변형된 배열을 다시 원상복귀
    if (dir === 'Up') {
      const reversedBoard = reverseRowElements(currBoard);
      this.state = swapRowsCols(reversedBoard);
    } else if (dir === 'Down') {
      this.state = swapRowsCols(currBoard);
    } else if (dir === 'Left') {
      this.state = reverseRowElements(currBoard);
    } else if (dir === 'Right') {
      this.state = currBoard;
    }
  }

  /**
   * 모든 블록을 제거하는 메소드
   */
  clear() {
    const $blocks = this.$board.querySelectorAll('.block');
    for (const $block of $blocks) {
      $block.remove();
    }
    this.$app.querySelector('.board-container').remove();
  }

  /**
   * 2048 완성 후 게임을 이어할 수 있도록 설정하는 메소드
   */
  continueBoard() {
    this.gameStopped = false;
    this.gameContinued = true;
  }

  /**
   * 해당 방향으로의 블록 이동을 포함한 전반적인 프로세스를 처리하는 메소드
   * @param {string} key - 키보드 이벤트 객체의 key 속성(`e.key`)에 해당하는 문자열
   */
  handleMove(key) {
    // 현재 블록 위치를 저장 (복사)
    this.prevState = copyMatrix(this.state);

    // 블록 이동
    this.moveBlock(key);

    // 블록 막힘 여부 확인
    if (!this.isStuck()) {
      // 점수, 턴 등 업데이트
      this.update();

      // 2048 완성 전까지만 게임 승리 여부 판단
      if (!this.gameContinued) {
        if (this.isGameClear()) {
          this.gameStopped = true;
          this.pressed = false;

          this.setHighScore(this.highScore);
          this.onGameClear();
        }
      }

      // 새 블록 생성
      this.createBlock();

      // 게임 오버 여부 판단
      if (this.isGameOver()) {
        this.gameStopped = true;

        this.setHighScore(this.highScore);
        this.onGameOver();
      }
    }
  }

  /**
   * 키보드 입력을 처리하는 이벤트 리스너
   * @param {KeyboardEvent} e - 키보드 이벤트 객체
   */
  keyboardEventListener({ key }) {
    if (this.gameStopped) return;

    const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (arrowKeys.includes(key)) {
      this.handleMove(key);
    }
  }

  /**
   * 슬라이드했을 때 방향을 판단하고 그에 따른 액션을 처리하는 메소드
   */
  handleSlide() {
    if (this.targetX > -1 && this.targetY > -1) {
      const diffX = this.sourceX - this.targetX;
      const diffY = this.sourceY - this.targetY;

      // X, Y 좌표 이동 절대값이 최소 기준값(threshold)를 넘지 않으면 무시
      if (Math.max(Math.abs(diffX), Math.abs(diffY)) < SLIDE_THRESHOLD) {
        return;
      }

      // 45도씩 8개의 분면으로 나누어서 슬라이드 방향 판단
      if (diffX >= 0 && diffY >= 0) {
        if (Math.abs(diffX) < Math.abs(diffY)) {
          this.handleMove('Up');
        } else {
          this.handleMove('Left');
        }
      } else if (diffX >= 0 && diffY < 0) {
        if (Math.abs(diffX) > Math.abs(diffY)) {
          this.handleMove('Left');
        } else {
          this.handleMove('Down');
        }
      } else if (diffX < 0 && diffY < 0) {
        if (Math.abs(diffX) < Math.abs(diffY)) {
          this.handleMove('Down');
        } else {
          this.handleMove('Right');
        }
      } else if (diffX < 0 && diffY >= 0) {
        if (Math.abs(diffX) > Math.abs(diffY)) {
          this.handleMove('Right');
        } else {
          this.handleMove('Up');
        }
      }
    }

    this.targetX = -1;
    this.targetY = -1;
  }

  /**
   * 마우스를 클릭하여 슬라이드를 시작했을 때 발생하는 이벤트를 처리하는 리스너
   * @param {MouseEvent}} e - 마우스 이벤트 객체
   */
  mouseDownListener({ clientX, clientY }) {
    if (this.gameStopped) return;

    this.pressed = true;

    this.sourceX = clientX;
    this.sourceY = clientY;
  }

  /**
   * 마우스 클릭을 중단하여 슬라이드를 끝냈을 때 발생하는 이벤트를 처리하는 리스너
   */
  mouseUpListener() {
    if (this.gameStopped) return;

    this.pressed = false;
    this.handleSlide();
  }

  /**
   * 마우스를 클릭한 상태로 슬라이드했을 때 발생하는 이벤트를 처리하는 리스너
   * @param {MouseEvent} e - 마우스 이벤트 객체
   */
  mouseMoveListener({ clientX, clientY }) {
    if (this.gameStopped || !this.pressed) return;
    
    this.targetX = clientX;
    this.targetY = clientY;
  }

  /**
   * 화면을 터치하여 슬라이드를 시작했을 때 발생하는 이벤트를 처리하는 리스너
   * @param {TouchEvent} e - 터치 이벤트 객체
   */
  touchStartListener(e) {
    if (this.gameStopped) return;

    this.pressed = true;

    this.sourceX = e.touches[0].clientX;
    this.sourceY = e.touches[0].clientY;
  }

  /**
   * 화면 터치를 중단하여 슬라이드를 끝냈을 때 발생하는 이벤트를 처리하는 리스너
   */
  touchEndListener() {
    if (this.gameStopped) return;

    this.pressed = false;
    this.handleSlide();
  }

  /**
   * 화면을 터치한 상태로 슬라이드했을 때 발생하는 이벤트를 처리하는 리스너
   * @param {TouchEvent} e - 터치 이벤트 객체
   */
  touchMoveListener(e) {
    if (this.gameStopped || !this.pressed) return;

    this.targetX = e.touches[0].clientX;
    this.targetY = e.touches[0].clientY;
  }
}

export default Board;
