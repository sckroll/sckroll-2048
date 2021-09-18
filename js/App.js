import Scene from './Scene.js';
import Info from './Info.js'
import Actions from './Actions.js';
import Board from './Board.js';
import Log from './Log.js';
import Popup from './Popup.js';
import config from './config.js';

const { 
  TITLE, 
  GAME_CLEAR_TITLE, 
  GAME_CLEAR_DESC, 
  GAME_OVER, 
  GAME_OVER_DESC, 
  LOG_GAME_CLEAR,
  LOG_GAME_OVER,
  TEXT_BUTTON_START, 
  TEXT_BUTTON_REPLAY,
  TEXT_BUTTON_CONTINUE
} = config;

class App {
  constructor($app) {
    this.$app = $app
    this.scene = new Scene($app);

    // 화면 렌더링
    this.popup = new Popup($app, {
      title: TITLE,
      buttonText1: TEXT_BUTTON_START
    }, () => this.startGame());
  }

  /**
  * 시작 버튼을 클릭했을 때 발생하는 이벤트를 처리하는 메소드
  */
  startGame() {
    // 팝업 및 오버레이 삭제
    this.popup.hide();
    
    // 이미 렌더링이 되어 있으면 렌더링 과정 생략
    if (!this.info) {
      this.info = new Info(this.$app);
    }
    if (!this.actions) {
      this.actions = new Actions(this.$app);
      this.actions.setReplayEvent(() => {
        this.startGame();
      });
    }
    if (!this.$app.querySelector('.ranking-container')) {
      this.scene.renderRanking();
    }
    if (!this.log) {
      this.log = new Log(this.$app, this.scene.$mainContainer);
    } else {
      this.log.clearLog();
    }

    // 보드 생성
    if (this.board) {
      // 기존 보드가 존재한다면 보드 내의 모든 블록 DOM 삭제
      this.board.clear();
    } else {
      // 키보드 이벤트 리스너 등록
      window.addEventListener('keydown', e => this.board.keyboardEventListener(e));
      window.addEventListener('mousedown', e => this.board.mouseDownListener(e));
      window.addEventListener('mouseup', () => this.board.mouseUpListener());
      window.addEventListener('mousemove', e => this.board.mouseMoveListener(e));
    }
    this.board = new Board(this.$app);
    
    // 보드 이벤트 설정
    this.setBoardEvents();

    // 점수 및 턴 초기화
    this.info.setHighScore(this.board.highScore);
    this.info.setScore(this.board.score);
    this.info.setTurn(this.board.turn);

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
      this.log.add(message, moveData, turn, prevState);
    })

    // 게임 승리 이벤트
    this.board.setGameClearEvent(() => {
      this.log.add(LOG_GAME_CLEAR);
      this.popup = new Popup(this.$app, 
        {
          title: GAME_CLEAR_TITLE,
          description: GAME_CLEAR_DESC,
          buttonText1: TEXT_BUTTON_REPLAY,
          buttonText2: TEXT_BUTTON_CONTINUE
        }, 
        () => this.startGame(),
        () => {
          this.popup.hide();
          this.board.continueBoard();
        });
    });

    // 게임 오버 이벤트
    this.board.setGameOverEvent(() => {
      this.log.add(LOG_GAME_OVER);
      this.popup = new Popup(this.$app, {
        title: GAME_OVER,
        description: GAME_OVER_DESC,
        buttonText1: TEXT_BUTTON_REPLAY
      }, () => this.startGame());
    });

    // 점수 업데이트 이벤트
    this.board.setScoreUpdateEvent(score => {
      this.info.setScore(score);
    });

    // 최고 점수 업데이트 이벤트
    this.board.setHighScoreUpdateEvent(highScore => {
      this.info.setHighScore(highScore);
    });

    // 현재 턴 업데이터 이벤트
    this.board.setTurnUpdateEvent(turn => {
      this.info.setTurn(turn);
    })
  }
}

export default App;
