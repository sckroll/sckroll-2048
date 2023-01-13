import config from './config.js';

const { ROW_NUM, COL_NUM, KEY_COLOR_MODE, VALUE_DARK } = config;

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

/**
 * 배열 형식의 데이터를 각 키의 순서에 맞게 매핑하여 객체 타입으로 반환하는 함수
 * @param {string[]} keys - 객체에 매핑시킬 키를 저장한 문자열 배열
 * @param {any[]} values - 객체에 매핑시킬 값을 저장한 배열
 * @returns {object} 각 키와 값이 매핑된 객체
 */
export function objectMapper(keys, values) {
  const result = {};

  for (let i = 0; i < keys.length; i++) {
    result[keys[i]] = values[i];
  }

  return result;
}

/**
 * 2차원 행렬을 복사하는 함수
 * @param {number[][]} source - 복사의 대상이 되는 2차원 배열
 * @returns {number[][]} 복사된 2차원 배열
 */
export function copyMatrix(source) {
  const copied = [];

  for (let i = 0; i < ROW_NUM; i++) {
    copied.push([...source[i]]);
  }
  
  return copied;
}

/**
 * 현재 다크 모드 적용 여부를 반환하는 메소드
 * @returns {boolean} 다크 모드 여부
 */
export function isDarkMode() {
  const { matches } = window.matchMedia('(prefers-color-scheme: dark)');

  // 로컬 스토리지 -> OS 설정값 순으로 판단
  const isStorageValueDark = localStorage.getItem(KEY_COLOR_MODE) === VALUE_DARK;
  const isOSValueDark = matches && !localStorage.getItem(KEY_COLOR_MODE);
  return isStorageValueDark || isOSValueDark;
}