import Block from './Block.js';
import { ROW_NUM, COL_NUM } from './config.js';
import { swapRowsCols, reverseRowElements } from './utils.js';

class Board {
  constructor($app) {
    this.state = [];
    this.emptyPos = [];
    this.blockMoveData = [];
    this.score = 0;
    this.turn = 0;
    this.largestNum = 0;

    this.createDOM($app);
    this.initialize();
  }

  // DOM 초기화
  createDOM($app) {
    this.$app = $app;
    this.$board = $app.querySelector('.board.front');
    this.$score = $app.querySelector('.score');
    this.$message = $app.querySelector('.message-container');
  }

  // 보드 초기화
  initialize() {
    for (let row = 0; row < ROW_NUM; row++) {
      this.state.push([]);
      for (let col = 0; col < COL_NUM; col++) {
        this.state[row].push(0);
        this.emptyPos.push(`${row}${col}`);
      }
    }
  }

  // 새 블록 생성
  createBlock() {
    const block = new Block(this.$board, this.emptyPos);
    this.state[block.row][block.col] = block.value;
  }

  // 블록 배치 테스트
  setTest() {
    for(let i = 2; i <= 2048; i*=2) {
      const block = new Block(this.$board, this.emptyPos, i);
      this.state[block.row][block.col] = block.value;
    }
  }

  // 블록 및 점수 렌더링
  render() {
    this.turn += 1;

    if (this.turn === 1) {
      this.createBlock();
    }
    this.createBlock();
  }

  // 승리 조건(2048 완성)을 달성했는지 검사하는 메소드
  isFinished() {
    return this.largestNum === 2048;
  }

  // 패배 조건(모든 블록으로 채워짐 & 4방향으로 모두 움직일 수 없음)을 달성했는지 검사하는 메소드
  isGameOver() {
    if (this.emptyPos.length > 0) return false;
    return !this.checkMovableBlock();
  }

  // 블록을 움직일 수 있는지 여부를 반환하는 메소드
  isMovable() {
    return this.blockMoveData.length > 0;
  }

  // 블록 이동 후 나머지 업데이트
  update() {
    for (let data of this.blockMoveData) {
      const [prevRow, prevCol, nextRow, nextCol, prevValue, nextValue, isCollapsed,] = data;
      const $block = this.$board.querySelector(`.r${prevRow}.c${prevCol}`);

      if (isCollapsed) {
        $block.remove();
        this.score += nextValue * 2;
        this.$score.innerText = this.score;
      } else {
        $block.classList.replace(`r${prevRow}`, `r${nextRow}`);
        $block.classList.replace(`c${prevCol}`, `c${nextCol}`);
        $block.classList.replace(`color-${prevValue}`, `color-${nextValue}`);
        $block.innerText = nextValue;

        const nextPosIdx = this.emptyPos.findIndex(pos => pos === `${nextRow}${nextCol}`);
        this.emptyPos.splice(nextPosIdx, 1);
      }
      this.emptyPos.push(`${prevRow}${prevCol}`);
    }
    this.blockMoveData = [];
  }

  // 블록이 꽉 찼을 때 움직일 수 있는지 여부를 검사하는 메소드
  checkMovableBlock() {
    for (let row = 0; row < ROW_NUM; row++) {
      for (let col = 0; col < COL_NUM - 1; col++) {
        if (this.state[row][col] === this.state[row][col + 1]) {
          return true;
        }
      }
    }
    for (let col = 0; col < ROW_NUM; col++) {
      for (let row = 0; row < COL_NUM - 1; row++) {
        if (this.state[row][col] === this.state[row + 1][col]) {
          return true;
        }
      }
    }
    return false;
  }

  // 이동 후의 행과 열의 좌표 정보를 계산하는 메소드
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

  // 블록의 이동을 처리하는 메소드
  move(key) {
    const dir = key.replace('Arrow', '');

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

    for (let row = 0; row < currBoard.length; row++) {
      const moveData = this.getAfterMoveData(currBoard[row], row, dir);
      if (moveData.length > 0) {
        this.blockMoveData.push(...moveData);
      }
    }

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

  // 키보드 이벤트 리스너
  keyboardEventListener({ key }) {
    const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (arrowKeys.includes(key)) {
      this.move(key);
      if (this.isGameOver()) {
        this.$message.innerText = 'GAME OVER';
        return;
      }
      if (this.isMovable()) {
        this.update();
        if (this.isFinished()) {
          this.$message.innerText = 'CONGRATULATIONS!';
          return;
        }
        this.render();
      }
    }
  }
}

export default Board;
