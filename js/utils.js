import { ROW_NUM, COL_NUM } from './config.js';

/**
 * 행렬의 각 열과 행을 스왑하는 함수
 * @param {number[][]} board - 블록의 상태를 나타내는 숫자 형식의 2차원 배열
 * @returns {number[][]} 스왑된 행렬 배열
 */
export function swapRowsCols(board) {
  const swapped = [];

  for (let row = 0; row < ROW_NUM; row++) {
    swapped.push([]);
    for (let col = 0; col < COL_NUM; col++) {
      swapped[row].push(board[col][row]);
    }
  }

  return swapped;
}

/**
 * 각 행의 모든 요소를 뒤집는 함수
 * @param {number[][]} board - 블록의 상태를 나타내는 숫자 형식의 2차원 배열
 * @returns {number[][]} 각 행이 모두 뒤집힌 배열
 */
export function reverseRowElements(board) {
  const reversed = [];

  for (let row = 0; row < ROW_NUM; row++) {
    reversed.push(board[row].reverse());
  }

  return reversed;
}