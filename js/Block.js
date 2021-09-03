class Block {
  constructor($board, emptyPos, value) {
    this.value = value || Math.floor(Math.random() * 2) * 2 + 2;

    const idx = Math.floor(Math.random() * emptyPos.length);
    const [row, col] = emptyPos.splice(idx, 1)[0];

    this.setCoord(parseInt(row), parseInt(col));
    this.render($board);
  }

  setCoord(row, col) {
    this.row = row;
    this.col = col;
  }

  render($board) {
    const $block = document.createElement('div');

    $block.classList.add('block', `color-${this.value}`, `r${this.row}`, `c${this.col}`);
    $block.innerText = this.value;

    $board.appendChild($block);
  }
}

export default Block;