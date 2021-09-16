import config from './config.js';

const { TITLE, TEXT_HIGH_SCORE, TEXT_SCORE_TITLE, TEXT_TURN_TITLE } = config;

class Info {
  /**
   * 상단 정보 컨테이너를 관리하는 클래스
   * @param {HTMLElement} $app - 루트 DOM 객체
   */
  constructor($app) {
    this.$app = $app;

    this.init();
    this.render();
  }

  /**
   * 상단 영역을 초기화하는 메소드
   */
  init() {
    // 상단 영역 컨테이너 DOM
    const $infoContainer = document.createElement('div');
    $infoContainer.classList.add('info-container');
    this.$app.prepend($infoContainer);
  
    // 제목 DOM
    const $title = document.createElement('h1');
    $title.innerText = TITLE;
    $infoContainer.appendChild($title);
  
    // 제목을 제외한 나머지를 감싸는 영역 DOM
    const $infoWrapper = document.createElement('div');
    $infoWrapper.classList.add('info-wrapper');
    $infoContainer.appendChild($infoWrapper);
  
    // 최고 점수 컨테이너 DOM
    const $highScoreContainer = document.createElement('div');
    $highScoreContainer.classList.add('info');
    $highScoreContainer.innerText = `${TEXT_HIGH_SCORE}:`;
    $infoWrapper.appendChild($highScoreContainer);
  
    // 최고 점수 DOM
    const $highScore = document.createElement('div');
    $highScore.classList.add('info-value');
    $highScoreContainer.appendChild($highScore);
    this.$highScore = $highScore;
  
    // 점수 컨테이너 DOM
    const $scoreContainer = document.createElement('div');
    $scoreContainer.classList.add('info');
    $scoreContainer.innerText = `${TEXT_SCORE_TITLE}:`;
    $infoWrapper.appendChild($scoreContainer);
  
    // 점수 DOM
    const $score = document.createElement('div');
    $score.classList.add('info-value');
    $scoreContainer.appendChild($score);
    this.$score = $score;
  
    // 턴 컨테이너 DOM
    const $turnContainer = document.createElement('div');
    $turnContainer.classList.add('info');
    $turnContainer.innerText = `${TEXT_TURN_TITLE}:`;
    $infoWrapper.appendChild($turnContainer);
  
    // 턴 DOM
    const $turn = document.createElement('div');
    $turn.classList.add('info-value');
    $turnContainer.appendChild($turn);
    this.$turn = $turn;
  }

  /**
   * 최고 점수를 설정하는 메소드
   * @param {Number} highScore - 현재 최고 점수
   */
  setHighScore(highScore) {
    this.highScore = highScore;
    this.render();
  }

  /**
   * 점수를 설정하는 메소드
   * @param {Number} score - 현재 점수
   */
  setScore(score) {
    this.score = score;
    this.render();
  }
  
  /**
   * 현재 턴을 설정하는 메소드
   * @param {Number} turn - 현재 턴
   */
  setTurn(turn) {
    this.turn = turn;
    this.render();
  }

  /**
   * 상단 영역을 렌더링
   */
  render() {
    this.$highScore.innerText = this.highScore;
    this.$score.innerText = this.score;
    this.$turn.innerText = this.turn;
  }
}

export default Info;
