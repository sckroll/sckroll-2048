import Scene from './scene.js';
import Board from './Board.js';

class App {
  constructor($app) {
    // 화면 렌더링
    this.scene = new Scene($app);
    this.scene.renderPopup({
      title: 'Sckroll 2048',
      buttonText: 'START'
    }, () => this.startGame($app));
  }
  
  /**
  * 시작 버튼을 클릭했을 때 발생하는 이벤트를 처리하는 메소드
  * @param {HTMLElement} $app - 루트 DOM 객체
  */
  startGame($app) {
    // 팝업 및 오버레이 삭제
    this.scene.hideOverlay();
    if (!$app.querySelector('.info-container')) {
      this.scene.renderInfo();
    }
    if (!$app.querySelector('.actions-container')) {
      this.scene.setReplayEvent(() => {
        this.startGame($app);
      });
      this.scene.renderActions();
    }
    if (!$app.querySelector('.ranking-container')) {
      this.scene.renderRanking();
    }
    if (!$app.querySelector('.log-container')) {
      this.scene.renderLog();
    } else {
      this.scene.clearLog();
    }
    
    // 보드 생성
    if (this.board) {
      // 기존 보드가 존재한다면 보드 내의 모든 블록 DOM 삭제
      const $blocks = $app.querySelectorAll('.block');
      for (const $block of $blocks) {
        $block.remove();
      }
    } else {
      // 키보드 이벤트 리스너 등록
      // window.addEventListener('keydown', board.keyboardEventListener); // Error
      // window.addEventListener('keydown', board.keyboardEventListener.bind(board)); // OK
      window.addEventListener('keydown', e => this.board.keyboardEventListener(e));
    }
    this.board = new Board($app);

    // 보드 이벤트 설정
    this.board.setCreateBlockEvent(block => {
      this.scene.renderNewBlock(block);
    });
    this.board.setUpdateBlockEvent(moveData => {
      this.scene.renderUpdatedBlock(moveData);
    })
    this.board.setUpdateLogEvent((message, moveData, turn, prevState) => {
      this.scene.addToLog(message, moveData, turn, prevState);
    })
    this.board.setClearEvent(() => {
      this.scene.renderPopup({
        title: 'CONGRATULATIONS!',
        description: '축하합니다! 2048을 완성했습니다.',
        buttonText: 'REPLAY'
      }, () => this.startGame($app));
    });
    this.board.setGameOverEvent(() => {
      this.scene.addToLog('--- 게임 오버 ---')
      this.scene.renderPopup({
        title: 'GAME OVER',
        description: '저런! 다시 도전하세요.',
        buttonText: 'REPLAY'
      }, () => this.startGame($app));
    });
    this.board.setScoreUpdateEvent(score => {
      this.scene.renderScore(score);
    });
    this.board.setHighScoreUpdateEvent(highScore => {
      this.scene.renderHighScore(highScore);
    });
    this.board.setTurnUpdateEvent(turn => {
      this.scene.renderTurn(turn);
    })

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
}

export default App;
