# Sckroll 2048 v2 작업 컨텍스트

## 프로젝트 목적

Vanilla JavaScript 기반 2048 클론을 TypeScript·Canvas 중심의 v2로 전환하는 프로젝트임.
v2의 핵심 범위는 새 디자인과 애니메이션, 이력 기반 undo/redo, 2048 이상 목표 설정임.

## 현재 기준선

- 브랜치: <code>v2</code>
- 진입점: <code>index.html</code> → <code>js/main.js</code> → <code>js/App.js</code>
- 게임 핵심: <code>js/Board.js</code>
- 화면 로그: <code>js/Log.js</code>
- 스타일: <code>css/style.css</code>, <code>css/variables.css</code>
- 빌드·패키지·테스트 설정: 아직 부재
- 현재 구현: 브라우저 ES 모듈을 직접 로드하는 정적 앱
- 분석 기준일: 2026년 7월 15일
- TypeScript 기준 버전: npm 최신 안정 7.0.2

## 먼저 읽을 문서

1. <code>docs/README.md</code>의 문서 지도
2. <code>docs/01-current-state.md</code>의 기준선
3. 작업 영역에 대응하는 세부 설계·검증 문서

## 현재 판정

- 고정 4×4 이동·병합의 일반 경로 정확성과 계산 속도는 양호한 수준
- 핵심 성능 위험은 성공 턴마다 누적되는 로그 DOM·리스너·행렬 JSON
- 핵심 구조 위험은 <code>Board</code>의 규칙·DOM·입력·저장소 책임 집중
- 핵심 상태 위험은 행렬, 빈 좌표, 최대 타일, DOM의 중복 표현
- 현재 로그는 화면 요소이며 완전한 undo/redo 데이터로 사용 불가
- 기존 코드는 특성 테스트와 비교 기준으로 보존할 가치가 있는 상태

## 알려진 레거시 결함

- 같은 턴의 승리·게임 오버 콜백 중복 가능성
- 로그 닫힘 상태에서도 분리된 DOM의 계속된 증가
- 새 최고 점수의 승리·패배 전 재시작 또는 새로고침 시 유실
- 임계값 미만 드래그 뒤 좌표 잔존에 따른 다음 클릭 오입력
- 팝업 역할·포커스 관리와 보드 상태 의미론 부재
- 모바일 세로 화면에서 열린 로그의 보드 가림
- 844×390 가로 화면에서 보드와 하단 영역 겹침
- 2048 초과 타일의 색상과 글자 크기 규칙 부재
- 새 타일 2와 4가 각각 50%인 현행 규칙

## v2 필수 불변식

- <code>GameState</code>가 게임 상태의 단일 진실 원천
- 빈 좌표와 최대 타일은 보드에서 계산하는 파생값
- 성공 이동 한 번이 이력 항목 한 개
- 이동 불가 입력에서 보드·점수·턴·이력·난수 호출 불변
- 한 타일의 한 턴 두 번 병합 금지
- 이동·병합 단계의 타일 합 보존과 완성 턴 합의 생성 타일 값만큼 증가
- 점수 증가량과 병합 결과 타일 합계 일치
- 유효 이동 뒤 새 타일 한 개 생성
- <code>snapshots.length = entries.length + 1</code>
- 이력 커서가 현재 표시 상태를 지시하는 구조
- redo에서 난수 호출 금지
- undo 뒤 새 이동에서 미래 이력 제거
- 계속하기는 새 항목·턴 증가 없이 현재 스냅샷을 <code>continued</code>로 교체
- 최고 점수는 undo 대상에서 제외되는 목표별 단조 증가값
- 목표 달성과 게임 오버가 겹칠 때 대화상자 한 개만 표시

## 목표 계층

| 계층 | 책임 |
|---|---|
| <code>domain</code> | 순수 이동·병합·생성·점수·승패 |
| <code>application</code> | 컨트롤러, 명령, 이력, 상태 커밋 |
| <code>ui</code> | Canvas 렌더러, 입력, HUD, 이력, 대화상자 |
| <code>infrastructure</code> | 저장소와 난수 구현 |
| <code>bootstrap</code> | 객체 생성과 의존성 연결 |

<code>domain</code>에서 DOM, Canvas, 로컬 저장소, 브라우저 전역 사용 금지.
<code>ui</code>에서 이동·병합·점수 규칙 재구현 금지.
Canvas는 보드 시각화에 사용하고 HUD·제어·대화상자·접근성 표현은 DOM으로 유지.

## 권장 핵심 파일

~~~text
src/domain/types.ts
src/domain/game-engine.ts
src/domain/move.ts
src/domain/spawn.ts
src/application/game-controller.ts
src/application/history-store.ts
src/ui/input-controller.ts
src/ui/canvas/canvas-renderer.ts
src/ui/canvas/animation-loop.ts
src/ui/views/history-view.ts
src/infrastructure/browser-storage.ts
~~~

## TypeScript 규칙

- 구현 시작 시 npm 최신 TypeScript 재확인
- 정확한 버전과 잠금 파일 커밋
- <code>strict</code> 활성화
- <code>noUncheckedIndexedAccess</code> 활성화
- <code>exactOptionalPropertyTypes</code> 활성화
- 방향을 리터럴 유니온으로 표현
- 행렬 인덱스의 존재 가정 금지
- DOM 조회 결과의 검증 없는 단언 금지
- 저장 JSON의 타입 단언만으로 신뢰 금지
- 타입 오류 억제 주석은 근거와 제거 조건 기록

## Canvas와 애니메이션 규칙

- 안정적인 타일 ID 사용
- CSS 크기와 DPR을 분리한 backing store 설정
- <code>ResizeObserver</code> 기반 크기 갱신
- 한 시점의 <code>requestAnimationFrame</code> 루프 한 개
- 이동, 병합, 생성 전환의 의미 분리
- 상태 커밋 한 번과 프레임 보간의 분리
- 논리 상태·이력 커서는 선커밋하고 Canvas만 중간 시각 상태로 보간
- 모션 감소에서 즉시 최종 프레임 표시
- 렌더러 폐기 시 프레임과 관찰자 정리
- 프로파일링 근거 없는 Worker·<code>OffscreenCanvas</code> 도입 보류

## 입력 규칙

- 키보드와 Pointer Events 사용
- 포인터 입력을 보드 영역으로 제한
- 포인터 캡처와 <code>pointercancel</code> 처리
- 시작·종료·취소마다 입력 세션 전체 초기화
- 애니메이션 중 최대 2개 방향 큐
- undo·redo·새 게임·목표 변경은 대기 방향 큐 제거와 최종 프레임 정규화 후 즉시 처리
- 대화상자와 폼 제어 포커스에서 게임 이동 차단
- 사용한 방향키의 기본 스크롤만 차단

## 목표와 이력 정책

- 기본 프리셋: 2048, 4096, 8192, 16384
- 사용자 목표: 2의 거듭제곱
- 권장 범위: 2¹¹부터 2³⁰
- 게임 중 목표 변경 확정 시 새 게임과 빈 이력 생성
- 목표별 최고 점수 저장
- 이력 권장 상한: 성공 이동 10,000개
- 로그 화면: 이력 데이터의 가상화된 읽기 전용 투영
- 로그 닫힘: 화면 노드 제거와 이력 데이터 유지

## 접근성과 반응형 기준

- Canvas 밖의 숨김 보드 표현 또는 행별 상태 텍스트 제공
- 점수 증가와 목표 달성의 정중한 live region 제공
- 대화상자 제목 연결, 포커스 트랩, 닫힘 후 복귀
- 모든 아이콘 버튼의 한국어 접근 이름
- 최소 44×44 CSS 픽셀 조작 영역
- 모션 감소와 시스템 테마 반영
- 320px 세로 화면과 844×390 가로 화면 지원
- 모바일 이력은 하단 시트, 데스크톱 이력은 우측 패널
- 열린 이력과 보드 조작 영역의 겹침 금지

## 구현 순서

1. 레거시 기준 데이터와 결함 재현 절차 기록
2. 패키지·TypeScript·빌드·CI 기반과 특성 테스트 자동화
3. 순수 게임 엔진
4. 이력 저장소와 컨트롤러
5. Canvas 렌더러와 애니메이션
6. 입력과 접근 가능한 DOM
7. 이력 화면과 새 디자인
8. 저장소 마이그레이션
9. 새 진입점 전환과 레거시 정리

순서 변경 시 앞 단계의 검증 가능성을 유지할 근거 기록 필요.

## 검증 명령

현재는 <code>package.json</code> 부재로 공식 명령이 없는 상태임.
도구 기반 추가 뒤 다음 명령 역할을 유지할 필요가 있음.

- <code>npm run typecheck</code>
- <code>npm run test</code>
- <code>npm run test:e2e</code>
- <code>npm run lint</code>
- <code>npm run build</code>

코드 변경 완료 전 관련 단위 테스트, 타입 검사, 프로덕션 빌드 실행 필요.
Canvas·레이아웃 변경 시 핵심 화면 크기의 실제 렌더 확인 필요.

## 문서 규칙

- 프로젝트 문서는 한국어 작성
- 문장 종결은 명사형 중심
- 한 문서 200줄 이하 유지
- 파일 역할, 상태 불변식, 사용자 동작 변경의 같은 커밋 갱신
- README 이미지와 실제 화면 차이 발생 시 README 갱신
- 특정 버전과 최신 상태를 언급할 때 확인 날짜와 공식 근거 기록

## 변경 전 확인 목록

- 변경이 속한 계층과 금지 의존 확인
- 게임 상태와 UI 임시 상태의 구분
- 이력에 포함될 상태와 제외될 상태 확인
- undo/redo·승리·패배에 미치는 영향 확인
- 모션 감소와 키보드 흐름 확인
- 높은 목표와 긴 이력에서의 동작 확인
- 레거시 파일의 사용자 변경 보존
