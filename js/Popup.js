class Popup {
  /**
   * 팝업 창을 관리하는 클래스
   * @param {HTMLElement} $app - 루트 DOM 객체
   * @param {{title: string, description: string, buttonText1: string, buttonText2?: string}} option - 팝업 창 옵션
   * @param {() => void} onClick1 - 첫 번째 버튼을 클릭했을 때 실행되는 함수
   * @param {() => void} [onClick2] - 첫 번째 버튼을 클릭했을 때 실행되는 함수
   */
  constructor($app, option, onClick1, onClick2) {
    this.$app = $app;
    this.option = option;
    this.onClick1 = onClick1;
    this.onClick2 = onClick2;

    this.render();
  }

  /**
   * 팝업 창 오버레이를 렌더링하는 메소드
   */
  showOverlay() {
    const $overlay = document.createElement('div');
    $overlay.classList.add('overlay');
    this.$app.appendChild($overlay);
    this.$overlay = $overlay;
  }

  /**
   * 팝업 창과 팝업 창 오버레이를 숨기는 메소드
   */
  hideOverlay() {
    if (this.$overlay) {
      this.$overlay.remove();
      this.$overlay = null;
    }
  }

  /**
   * 팝업 창을 숨기는 메소드
   */
  hide() {
    this.hideOverlay();
  }

  /**
   * 팝업 창을 렌더링하는 메소드
   */
  render() {
    // 오버레이 렌더링
    this.showOverlay();

    // 팝업 창 DOM
    const $popupContainer = document.createElement('div');
    $popupContainer.classList.add('popup-container');
    this.$overlay.appendChild($popupContainer);

    // 팝업 제목 컨테이너 DOM
    const $titleContainer = document.createElement('div');
    $titleContainer.classList.add('title-container');
    $popupContainer.appendChild($titleContainer);

    // 제목 DOM
    const $popupTitle = document.createElement('h1');
    $popupTitle.classList.add('popup-title');
    $popupTitle.innerText = this.option.title;
    $titleContainer.appendChild($popupTitle);

    // 세부 설명 DOM
    if (this.option.description) {
      const $popupDescription = document.createElement('p');
      $popupDescription.classList.add('popup-description');
      $popupDescription.innerText = this.option.description;
      $titleContainer.appendChild($popupDescription);
    }

    // 버튼 컨테이너 DOM
    const $buttonContainer = document.createElement('div');
    $buttonContainer.classList.add('button-container');
    $popupContainer.appendChild($buttonContainer);

    // 버튼 DOM
    const $popupButton1 = document.createElement('button');
    $popupButton1.innerText = this.option.buttonText1;
    $popupButton1.addEventListener('click', e => this.onClick1(e));
    $buttonContainer.appendChild($popupButton1);
    if (this.onClick2) {
      const $popupButton2 = document.createElement('button');
      $popupButton2.innerText = this.option.buttonText2;
      $popupButton2.addEventListener('click', e => this.onClick2(e));
      $buttonContainer.appendChild($popupButton2);
    }
  }
}

export default Popup;
