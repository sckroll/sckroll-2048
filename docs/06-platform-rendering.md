# v2 플랫폼과 렌더링

## TypeScript 기준

2026년 7월 15일 npm <code>latest</code> 기준 TypeScript 버전은 7.0.2임.
근거는 [TypeScript npm 최신 메타데이터](https://registry.npmjs.org/typescript/latest)임.
구현 시작 시 최신 메타데이터를 다시 확인하고 정확한 버전과 잠금 파일을 함께 커밋하는 정책이 필요함.

권장 컴파일러 기준은 다음과 같음.

- <code>strict</code>
- <code>noUncheckedIndexedAccess</code>
- <code>exactOptionalPropertyTypes</code>
- <code>noImplicitOverride</code>
- <code>noFallthroughCasesInSwitch</code>
- <code>useDefineForClassFields</code>
- <code>verbatimModuleSyntax</code>
- 브라우저 번들러에 맞는 <code>moduleResolution</code>
- 배포 브라우저 범위에 맞는 <code>target</code>과 <code>lib</code>

빌드 도구는 얇은 정적 앱 구성을 유지할 수 있는 Vite 계열 구성을 권장함.
도구 버전은 설치 시점의 안정 버전을 확인하고 정확한 버전으로 고정할 필요가 있음.
Node.js와 npm은 빌드 도구 호환 범위를 확인해 <code>engines</code>와 버전 파일에 고정할 필요가 있음.

## Canvas 렌더러

- Canvas를 보드와 타일의 시각 렌더링에 한정
- 점수, 버튼, 목표 선택, 대화상자, 이력을 DOM으로 유지
- CSS 크기와 <code>devicePixelRatio</code>를 반영한 backing store 설정
- <code>ResizeObserver</code>를 통한 크기 갱신
- 보드 배경, 빈 셀, 타일, 숫자를 매 프레임 전체 그리기
- 타일 16개 규모에 적합한 단순 전체 재그리기
- 하나의 <code>requestAnimationFrame</code> 루프
- 이동, 병합, 생성의 시간축 분리
- 애니메이션 완료·취소·모션 감소의 단일 종료 경로
- 팔레트 함수와 숫자 자릿수별 글꼴 크기 함수 분리

## Canvas 상태 계약

- <code>GameState</code>를 최종 프레임의 유일한 입력으로 사용
- <code>TileTransition</code>을 중간 프레임의 보간 정보로 사용
- 타일 ID를 이동 전후의 동일성 키로 사용
- 병합 출발 타일 두 개와 결과 타일 한 개의 명시적 연결
- 생성 타일을 이동 종료 뒤 별도 전환으로 표시
- 프레임 진행 중 엔진 상태 재계산 금지
- 탭 복귀와 크기 변경 시 최종 프레임 정규화
- 그리기 오류가 게임 상태를 변경하지 않는 경계
- 컨트롤러의 상태 선커밋과 렌더러 완료 신호 뒤 FIFO 방향 큐 처리
- 선커밋 직후 논리 상태·이력 커서·HUD·접근성 상태를 <code>next</code>로 갱신
- 애니메이션 중 Canvas만 <code>previous</code>와 <code>next</code> 사이의 시각 상태를 표현

## 입력 제어기

- 키보드 입력과 Pointer Events의 한 모듈 통합
- 보드 요소의 <code>pointerdown</code>, <code>pointermove</code>, <code>pointerup</code>, <code>pointercancel</code> 처리
- <code>setPointerCapture</code>를 통한 포인터 세션 보존
- 보드 표면의 <code>touch-action: none</code>
- 시작·종료·취소 시 좌표와 포인터 ID 초기화
- 애니메이션 중 최대 2개 방향의 제한 입력 큐
- 텍스트 입력과 버튼 포커스에서 방향키 가로채기 금지
- 게임 영역에서 사용한 방향키의 기본 스크롤만 차단

## 접근 가능한 보조 계층

- Canvas를 <code>aria-hidden</code> 시각 표면으로 처리
- 포커스 가능한 게임 영역에 조작 설명 연결
- 보드의 숨김 표 또는 행별 텍스트 표현
- 점수 증가, 목표 달성, undo/redo 결과용 정중한 live region
- HUD, 이력, 설정, 대화상자의 의미 있는 DOM 유지
- 모션 감소 환경에서 애니메이션 시간 0 적용
- Canvas 미지원 또는 초기화 실패의 텍스트 안내

## 저장소

~~~ts
interface StoredDataV2 {
  readonly version: 2;
  readonly preferences: {
    readonly theme: 'system' | 'light' | 'dark';
    readonly target: number;
    readonly reducedMotionOverride: boolean | null;
  };
  readonly bestScores: Readonly<Record<string, number>>;
}
~~~

- 읽기 시 JSON 파싱, 버전 확인, 범위 검증, 기본값 복구
- v1의 <code>light</code>·<code>dark</code> 테마를 그대로 승계하고 값 부재 시 <code>system</code> 적용
- v1 최고 점수를 목표 2048 기록으로 일회성 변환
- 최고 점수 갱신 즉시 저장
- 목표별 최고 점수 키 사용
- 사용자 모션 선택값 우선, 선택값 부재 시 시스템 모션 설정 적용
- 쓰기 실패 시 게임 진행 유지
- 이력과 현재 게임의 영속화는 v2 핵심 범위 밖의 후속 선택 사항

## v2 제외 플랫폼 범위

- 사용자 계정과 서버 동기화
- Worker와 <code>OffscreenCanvas</code>
- 리플레이 파일 내보내기
- 가변 보드 크기
- 라우팅 시스템

프로파일링과 제품 요구가 생길 때 별도 설계로 검토할 범위임.

## 조립과 수명주기

<code>create-app.ts</code>가 엔진, 이력, 저장소, 입력, 화면, 렌더러를 생성하는 위치임.
각 UI 객체는 <code>mount</code>와 <code>destroy</code> 수명주기를 제공해야 함.
이벤트 등록과 해제의 대칭성, 애니메이션 프레임 취소, 관찰자 해제가 필수 조건임.

## 플랫폼 완료 기준

- 엄격한 타입 검사 오류 0건
- DPR 1·2·3의 좌표와 선명도 확인
- 크기 변경과 회전 뒤 상태·화면 일치
- 활성 애니메이션 루프 한 개
- 폐기 뒤 이벤트, 프레임, 관찰자 콜백 부재
- 키보드와 포인터의 같은 방향 명령 생성
- 저장소 손상과 사용 불가 환경의 안전한 시작
