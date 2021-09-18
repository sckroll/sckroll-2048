class Block {
  /**
   * 블록을 관리하는 클래스
   * @param {HTMLDivElement} $board - 보드 DOM 객체
   * @param {number[][]} state - 현재 보드의 상태를 저장한 2차원 배열
   * @param {string[]} emptyPos - 비어있는 보드 위치를 저장한 배열
   * @param {number} [value] - 블록의 값 (생략하면 2 혹은 4로 초기화)
   */
  constructor($board, state, emptyPos, value) {
    this.$board = $board;
    this.value = value || Math.floor(Math.random() * 2) * 2 + 2;

    const idx = Math.floor(Math.random() * emptyPos.length);
    const [row, col] = emptyPos.splice(idx, 1)[0];

    state[row][col] = this.value;

    this.setCoord(parseInt(row), parseInt(col));
    this.render();
  }

  /**
   * 블록의 행과 열 위치를 설정하는 메소드
   * @param {number} row - 블록이 위치할 행
   * @param {number} col - 블록이 위치할 열
   */
  setCoord(row, col) {
    this.row = row;
    this.col = col;
  }

  /**
   * 새로운 블록을 화면에 렌더링하는 메소드
   */
  render() {
    const $block = document.createElement('div');
    $block.classList.add('block', `color-${this.value}`, `r${this.row}`, `c${this.col}`);
    $block.innerText = this.value;
    this.$board.appendChild($block);
  }
}

export default Block;