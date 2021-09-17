import config from './config.js';
import { isDarkMode } from './utils.js';

const {
  TEXT_BUTTON_REPLAY,
  TEXT_BUTTON_LIGHT,
  TEXT_BUTTON_DARK,
  LINK_GITHUB,
  LINK_ORIGINAL,
  LINK_DEVELOPER,
  KEY_COLOR_MODE,
  VALUE_LIGHT,
  VALUE_DARK
} = config;

class Actions {
  /**
   * 하단 버튼 및 링크 컨테이너를 관리하는 클래스
   * @param {HTMLElement} $app - 루트 DOM 객체
   */
  constructor($app) {
    this.$app = $app;

    this.render();
  }

  /**
   * 하단 영역을 렌더링하는 메소드
   */
  render() {
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
    $replayButton.addEventListener('click', () => this.onReplay());
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
    if (isDarkMode()) {
      document.documentElement.setAttribute('color-mode', VALUE_DARK);
      $darkModeButton.classList.add(VALUE_DARK);
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
   * 다크 모드 여부를 토글하는 메소드
   * @param {MouseEvent} event - 마우스 클릭 이벤트
   */
  toggleColorMode({ target }) {
    if (target.classList.contains(VALUE_DARK)) {
      // 다크 모드 -> 라이트 모드
      document.documentElement.setAttribute('color-mode', VALUE_LIGHT);
      localStorage.setItem(KEY_COLOR_MODE, VALUE_LIGHT);
      this.$darkModeButton.innerText = TEXT_BUTTON_DARK;
    } else {
      // 라이트 모드 -> 다크 모드
      document.documentElement.setAttribute('color-mode', VALUE_DARK);
      localStorage.setItem(KEY_COLOR_MODE, VALUE_DARK);
      this.$darkModeButton.innerText = TEXT_BUTTON_LIGHT;
    }
    target.classList.toggle(VALUE_DARK);
  }

  /**
   * 재시작 버튼을 클릭했을 때 호출하는 함수를 설정하는 메소드
   * @param {() => void} onReplay - 재시작 버튼 클릭 시 호출하는 이벤트 함수
   */
  setReplayEvent(onReplay) {
    this.onReplay = onReplay;
  }
}

export default Actions;
