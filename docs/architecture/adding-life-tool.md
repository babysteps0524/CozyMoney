# 생활도구 추가 가이드

생활도구는 Astro의 정적 페이지 구조를 유지하고, 도구별 코드와 공통 UI를 분리한다.

## 파일별 책임

- `src/pages/tools/<slug>/index.astro`: URL, SEO 제목·설명, 페이지 헤더만 담당한다.
- `src/features/tools/<slug>/<Tool>.astro`: 해당 도구의 마크업만 담당한다.
- `src/features/tools/<slug>/<slug>.ts`: 순수 계산·변환 로직만 담당한다.
- `src/features/tools/<slug>/mount.ts`: UI 이벤트와 순수 로직을 연결한다.
- `src/features/tools/guides/<slug>.ts`: 목적, 사용 방법, 주의사항, FAQ만 담당한다.
- `src/features/tools/catalog.ts`: 목록 카드와 경로에 필요한 제목·설명·slug만 제공한다.
- `src/components/tool/ToolPanel.astro`: 도구별 Astro UI 컴포넌트를 선택한다.
- `src/lib/tool/runtime.ts`: 선택된 도구의 mount 모듈을 지연 로딩한다.
- `src/lib/tool/types.ts`: 허용되는 도구 식별자와 타입을 정의한다.

## 새 도구 추가 체크리스트

1. `src/features/tools/<slug>/` 아래에 UI, 순수 로직, mount 모듈을 만든다.
2. `src/features/tools/guides/<slug>.ts`에 독립적인 설명·FAQ를 작성하고 `guides/index.ts`에 등록한다.
3. `src/lib/tool/types.ts`, `src/features/tools/catalog.ts`, `src/components/tool/ToolPanel.astro`, `src/lib/tool/runtime.ts`에 식별자를 등록한다.
4. `src/pages/tools/<slug>/index.astro`를 추가한다.
5. `tests/tools/<slug>.test.ts`에 계산 로직 테스트를 추가한다.
6. `bun run verify`를 실행한다.

## 구조 원칙

- 한 파일에는 한 종류의 책임만 둔다.
- 계산 로직은 DOM과 분리해 테스트할 수 있게 작성한다.
- 콘텐츠는 화면 컴포넌트에 직접 넣지 않고 도구별 가이드 파일에서 관리한다.
- 새 도구를 추가할 때 기존 도구의 로직이나 설명 파일을 수정하지 않는다. 공통 등록부만 필요한 만큼 수정한다.
- 도구별 지연 로딩을 유지해 한 도구의 코드를 모든 페이지에 불필요하게 포함하지 않는다.
