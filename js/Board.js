import Block from './Block.js';
import { ROW_NUM, COL_NUM } from './config.js';
import { swapRowsCols, reverseRowElements } from './utils.js';

class Board {
  /**
   * 보드를 관리하는 클래스
   * @param {HTMLElement} $app - 루트 DOM 객체
   */
  constructor($app) {
    this.$board = $app.querySelector('.board.front');

    this.state = [];
    this.emptyPos = [];
    this.blockMoveData = [];
    this.score = 0;
    this.turn = 1;
    this.largestNum = 0;

    this.initialize();
  }

  /**
   * 보드 내 블록 위치를 나타내는 배열과 비어있는 블록 위치를 저장하는 배열을 초기화하는 메소드
   */
  initialize() {
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
   */
  createBlock() {
    const block = new Block(this.$board, this.emptyPos);
    this.state[block.row][block.col] = block.value;
    this.onBlockCreate(block);
  }

  /**
   * 새 블록을 생성했을 때 호출하는 함수를 설정하는 메소드
   * @param {(block: Block) => void} onCreate - 새 블록을 만들었을 때 호출하는 이벤트 함수
   */
  setCreateBlockEvent(onBlockCreate) {
    this.onBlockCreate = onBlockCreate;
  }

  /**
   * 블록을 업데이트하거나 삭제했을 때 호출하는 함수를 설정하는 메소드
   * @param {(moveData: MoveData) => void} onBlockUpdate - 블록을 업데이트했을 때 호출하는 이벤트 함수
   */
  setUpdateBlockEvent(onBlockUpdate) {
    this.onBlockUpdate = onBlockUpdate;
  }

  /**
   * 게임에서 승리했을 때 호출하는 함수를 설정하는 메소드
   * @param {() => void} onClear - 승리했을 때 호출하는 이벤트 함수
   */
  setClearEvent(onClear) {
    this.onClear = onClear;
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
   * 승리 조건(2048 완성)을 만족했는지 검사하는 메소드
   * @returns {boolean} 승리 조건 만족 여부
   */
  isClear() {
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
      this.onBlockUpdate(data);

      const [prevRow, prevCol, nextRow, nextCol, , nextValue, isCollapsed,] = data;

      if (isCollapsed) {
        this.score += nextValue * 2;
        this.onScoreUpdate(this.score);
      } else {
        const nextPosIdx = this.emptyPos.findIndex(pos => pos === `${nextRow}${nextCol}`);
        this.emptyPos.splice(nextPosIdx, 1);
      }
      this.emptyPos.push(`${prevRow}${prevCol}`);
    }
    this.blockMoveData = [];
    this.turn += 1;
    this.onTurnUpdate(this.turn);
  }

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

          switch (direction) {
            case 'Up':
              moveData.push([ROW_NUM - 1 - i, idx, ROW_NUM - 1 - i, idx, arr[i] / 2, arr[i] / 2, true, direction]);
              moveData.push([ROW_NUM - 1 - j, idx, ROW_NUM - 1 - i, idx, arr[i] / 2, arr[i], false, direction]);
              break;
            case 'Down':
              moveData.push([i, idx, i, idx, arr[i] / 2, arr[i] / 2, true, direction]);
              moveData.push([j, idx, i, idx, arr[i] / 2, arr[i], false, direction]);
              break;
            case 'Left':
              moveData.push([idx, ROW_NUM - 1 - i, idx, ROW_NUM - 1 - i, arr[i] / 2, arr[i] / 2, true, direction]);
              moveData.push([idx, ROW_NUM - 1 - j, idx, ROW_NUM - 1 - i, arr[i] / 2, arr[i], false, direction]);
              break;
            case 'Right':
              moveData.push([idx, i, idx, i, arr[i] / 2, arr[i] / 2, true, direction]);
              moveData.push([idx, j, idx, i, arr[i] / 2, arr[i], false, direction]);
              break;
          }

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

            switch (direction) {
              case 'Up':
                moveData.push([ROW_NUM - 1 - j, idx, ROW_NUM - 1 - i, idx, arr[i], arr[i], false, direction]);
                break;
              case 'Down':
                moveData.push([j, idx, i, idx, arr[i], arr[i], false, direction]);
                break;
              case 'Left':
                moveData.push([idx, ROW_NUM - 1 - j, idx, ROW_NUM - 1 - i, arr[i], arr[i], false, direction]);
                break;
              case 'Right':
                moveData.push([idx, j, idx, i, arr[i], arr[i], false, direction]);
                break;
            }
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
   * 블록의 이동을 처리하는 메소드
   * @param {string} key - 키보드 이벤트 객체의 key 속성(`e.key`)에 해당하는 문자열 값
   */
  move(key) {
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
   * 키보드 입력을 처리하는 이벤트 리스너
   * @param {KeyboardEvent} event - 키보드 이벤트 객체
   */
  keyboardEventListener({ key }) {
    const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (arrowKeys.includes(key)) {
      this.move(key);

      if (!this.isStuck()) {
        this.update();
        if (this.isClear()) {
          this.onClear();
          return;
        }

        this.createBlock();
        if (this.isGameOver()) {
          this.onGameOver();
          return;
        }
      }
    }
  }
}

export default Board;
