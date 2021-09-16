class Block {
  /**
   * 블록을 관리하는 클래스
   * @param {number[][]} state - 현재 보드의 상태를 저장한 2차원 배열
   * @param {string[]} emptyPos - 비어있는 보드 위치를 저장한 배열
   * @param {number} [value] - 블록의 값
   */
  constructor(state, emptyPos, value) {
    this.value = value || Math.floor(Math.random() * 2) * 2 + 2;

    const idx = Math.floor(Math.random() * emptyPos.length);
    const [row, col] = emptyPos.splice(idx, 1)[0];

    state[row][col] = value;

    this.setCoord(parseInt(row), parseInt(col));
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
}

export default Block;