import Scene from './scene.js';
import Board from './Board.js';
import { messages } from './config.js';

const { 
  TITLE, 
  GAME_CLEAR_TITLE, 
  GAME_CLEAR_DESC, 
  GAME_OVER, 
  GAME_OVER_DESC, 
  BUTTON_START, 
  BUTTON_REPLAY,
  LOG_GAME_OVER
} = messages;

class App {
  constructor($app) {
    this.$app = $app
    this.scene = new Scene($app);

    // 화면 렌더링
    this.scene.renderPopup({
      title: TITLE,
      buttonText: BUTTON_START
    }, () => this.startGame());
  }

  /**
  * 시작 버튼을 클릭했을 때 발생하는 이벤트를 처리하는 메소드
  */
  startGame() {
    // 팝업 및 오버레이 삭제
    this.scene.hideOverlay();
    if (!this.$app.querySelector('.info-container')) {
      this.scene.renderInfo();
    }

    // 이미 렌더링이 되어 있으면 렌더링 과정 생략
    if (!this.$app.querySelector('.actions-container')) {
      this.scene.setReplayEvent(() => {
        this.startGame();
      });
      this.scene.renderActions();
    }
    if (!this.$app.querySelector('.ranking-container')) {
      this.scene.renderRanking();
    }
    if (!this.$app.querySelector('.log-container')) {
      this.scene.renderLog();
    } else {
      this.scene.clearLog();
    }

    // 보드 생성
    if (this.board) {
      // 기존 보드가 존재한다면 보드 내의 모든 블록 DOM 삭제
      const $blocks = this.$app.querySelectorAll('.block');
      for (const $block of $blocks) {
        $block.remove();
      }
    } else {
      // 키보드 이벤트 리스너 등록
      window.addEventListener('keydown', e => this.board.keyboardEventListener(e));
    }
    this.board = new Board(this.$app);
    
    // 보드 이벤트 설정
    this.setBoardEvents();

    // 점수 및 턴 초기화
    this.scene.renderHighScore(this.board.highScore);
    this.scene.renderScore(this.board.score);
    this.scene.renderTurn(this.board.turn);

    // 새 블록 생성
    if (this.board.turn === 1) {
      this.board.createBlock();
    }
    this.board.createBlock();
  }

  /**
  * 시작 버튼을 클릭했을 때 발생하는 이벤트를 처리하는 메소드
   */
  setBoardEvents() {
    // 블록 생성 이벤트
    this.board.setCreateBlockEvent(block => {
      this.scene.renderNewBlock(block);
    });

    // 블록 업데이트 이벤트
    this.board.setUpdateBlockEvent(moveData => {
      this.scene.renderUpdatedBlock(moveData);
    })

    // 로그 업데이트 이벤트
    this.board.setUpdateLogEvent((message, moveData, turn, prevState) => {
      this.scene.addToLog(message, moveData, turn, prevState);
    })

    // 게임 승리 이벤트
    this.board.setGameClearEvent(() => {
      this.scene.renderPopup({
        title: GAME_CLEAR_TITLE,
        description: GAME_CLEAR_DESC,
        buttonText: BUTTON_REPLAY
      }, () => this.startGame(this.$app));
    });

    // 게임 오버 이벤트
    this.board.setGameOverEvent(() => {
      this.scene.addToLog(LOG_GAME_OVER);
      this.scene.renderPopup({
        title: GAME_OVER,
        description: GAME_OVER_DESC,
        buttonText: BUTTON_REPLAY
      }, () => this.startGame(this.$app));
    });

    // 점수 업데이트 이벤트
    this.board.setScoreUpdateEvent(score => {
      this.scene.renderScore(score);
    });

    // 최고 점수 업데이트 이벤트
    this.board.setHighScoreUpdateEvent(highScore => {
      this.scene.renderHighScore(highScore);
    });

    // 현재 턴 업데이터 이벤트
    this.board.setTurnUpdateEvent(turn => {
      this.scene.renderTurn(turn);
    })
  }
}

export default App;
