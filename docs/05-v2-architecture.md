# v2 목표 아키텍처

## 설계 목표

- 게임 규칙의 DOM·Canvas 비의존성
- 한 번의 입력과 한 번의 원자적 상태 전이
- 완전한 undo/redo 재현성
- 목표 타일 변경과 높은 숫자 표시의 확장성
- Canvas 애니메이션과 접근 가능한 DOM의 공존
- 엄격한 TypeScript와 자동화된 검증
- 신규 작업자가 파일 위치만으로 책임을 추론할 수 있는 구조

## 권장 디렉터리

~~~text
src/
  main.ts
  bootstrap/
    create-app.ts
  domain/
    types.ts
    move.ts
    spawn.ts
    status.ts
    game-engine.ts
  application/
    game-controller.ts
    history-store.ts
  ui/
    input-controller.ts
    canvas/
      canvas-renderer.ts
      animation-loop.ts
      palette.ts
    views/
      hud-view.ts
      history-view.ts
      dialog-view.ts
      settings-view.ts
  infrastructure/
    browser-storage.ts
    random-source.ts
  styles/
    tokens.css
    app.css
tests/
  unit/
  integration/
  e2e/
~~~

## 의존 규칙

~~~text
bootstrap → application → domain
bootstrap → ui → domain
bootstrap → infrastructure
application → domain
ui → domain의 읽기 전용 타입
infrastructure → domain의 포트 타입
~~~

- <code>domain</code>에서 <code>document</code>, <code>window</code>, Canvas, 로컬 저장소 import 금지
- <code>ui</code>에서 이동·병합·점수 재계산 금지
- <code>infrastructure</code>에서 DOM 참조 금지
- <code>bootstrap</code>에서 규칙 구현 금지
- 방향, 좌표, 상태, 전환 이벤트의 타입 소유권을 <code>domain</code>에 배치

## 핵심 상태 모델

~~~ts
type Direction = 'up' | 'down' | 'left' | 'right';
type GamePhase = 'playing' | 'won' | 'continued' | 'lost';

interface Coordinate {
  readonly row: number;
  readonly col: number;
}

interface Tile {
  readonly id: number;
  readonly value: number;
}

type TileTransition =
  | { readonly kind: 'move'; readonly tileId: number; readonly from: Coordinate; readonly to: Coordinate }
  | { readonly kind: 'merge'; readonly sourceIds: readonly [number, number]; readonly result: Tile; readonly to: Coordinate };

interface SpawnedTile {
  readonly tile: Tile;
  readonly at: Coordinate;
}

interface GameState {
  readonly grid: ReadonlyArray<ReadonlyArray<Tile | null>>;
  readonly score: number;
  readonly turn: number;
  readonly target: number;
  readonly spawnFourProbability: number;
  readonly phase: GamePhase;
  readonly nextTileId: number;
}
~~~

타일 ID는 Canvas 이동·병합 애니메이션의 동일성 추적을 위한 값임.
빈 좌표와 최대 타일은 <code>grid</code>에서 계산하는 파생값임.
최고 점수는 undo 대상에서 제외되는 목표별 단조 증가 데이터임.
입력 중 포인터 좌표와 애니메이션 큐는 <code>GameState</code> 밖의 UI 상태임.
생성 확률은 새 게임 설정에서 상태로 복사되어 세션 동안 유지되는 불변 규칙임.
이동 타일은 ID를 유지하고 병합 결과와 생성 타일은 <code>nextTileId</code>의 새 ID를 사용하는 규칙임.

## 엔진 계약

~~~ts
interface RandomSource {
  next(): number;
}

interface GameConfig { readonly size: 4; readonly target: number; readonly spawnFourProbability: number; }
function createGame(config: Readonly<GameConfig>, random: RandomSource): GameState;

interface TurnResult {
  readonly changed: boolean;
  readonly previous: GameState;
  readonly next: GameState;
  readonly scoreDelta: number;
  readonly transitions: readonly TileTransition[];
  readonly spawned: SpawnedTile | null;
}

function applyTurn(
  state: Readonly<GameState>,
  direction: Direction,
  random: RandomSource,
): TurnResult;
~~~

- 이동 불가 입력에서 <code>changed=false</code>와 동일 상태 반환
- 유효 이동에서 이동·병합, 점수, 생성, 승패를 한 번에 계산
- 난수의 계약은 0 이상 1 미만이며 호출은 초기 생성과 유효 이동의 생성 단계로 제한
- <code>createGame</code>에서 설정 검증, 점수 0, 턴 1, 초기 타일 2개의 상태 생성 후 이력 저장소에서 첫 스냅샷 등록
- 렌더러용 전환 목록과 로그용 점수 증가량을 같은 결과에서 제공
- 기존 <code>MoveData</code>의 배열 순서 계약 제거
- 입력 상태의 직접 변경 없이 새 불변 상태 반환

## 한 턴의 처리 순서

1. 방향 유효성 확인
2. 행 압축과 한 번의 병합 계산
3. 변화 여부 확인
4. 점수와 턴 계산
5. 빈 셀에서 새 타일 생성
6. 목표 신규 달성과 이동 가능 여부 계산
7. 단일 게임 단계 결정
8. <code>TurnResult</code> 생성
9. 이력 커밋
10. UI와 Canvas 렌더 요청

목표 신규 달성과 이동 불가가 겹치면 목표 달성 화면 하나를 우선 표시하는 정책을 권장함.
추가 이동이 불가능한 경우 달성 화면에서 계속 버튼을 비활성화하는 처리임.

## 이력 저장소

권장 구조는 스냅샷 배열, 전이 메타데이터 배열, 현재 커서의 조합임.

~~~ts
interface HistoryEntry {
  readonly direction: Direction;
  readonly scoreDelta: number;
  readonly spawned: SpawnedTile;
  readonly transitions: readonly TileTransition[];
}

interface HistoryState {
  readonly snapshots: readonly GameState[];
  readonly entries: readonly HistoryEntry[];
  readonly cursor: number;
}
~~~

- <code>snapshots.length = entries.length + 1</code> 불변식
- 커서가 현재 화면의 스냅샷을 지시하는 구성
- undo에서 커서 감소와 해당 스냅샷 복원
- redo에서 커서 증가와 저장된 스냅샷 복원
- redo에서 난수 재호출 금지
- undo 뒤 새 이동에서 커서 이후 스냅샷과 항목 제거
- 이동 불가 입력의 이력 미기록
- 로그 화면을 <code>entries</code>·<code>snapshots</code>·<code>cursor</code> 전체의 읽기 전용 투영으로 구성

## 계속하기 승인 전이

- 목표 달성 직후의 현재 스냅샷은 <code>won</code>과 대화상자 상태를 표현
- 계속하기 명령은 새 이력 항목과 턴 증가 없이 현재 커서의 스냅샷을 동등한 <code>continued</code> 상태로 교체
- 계속하기 선택 전 undo 뒤 redo에서 <code>won</code> 대화상자 복원
- 계속하기 선택 후 이력 탐색에서 <code>continued</code> 복원과 목표 대화상자 재표시 금지
- 교체 시 기존 스냅샷 직접 변경 없이 새 불변 스냅샷 배열 생성
- <code>playing</code>·<code>continued</code>는 이동 허용, <code>won</code>·<code>lost</code>는 이동 차단과 이력·새 게임 명령 허용
