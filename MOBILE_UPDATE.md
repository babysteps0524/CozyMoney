# CozyMoney 모바일 반응형 개편

## 핵심 변경

- PC 고정폭 `1240px` 레이아웃을 반응형 `max-width` 구조로 변경
- 모바일에서 좌우 여백을 16px 기준으로 통일
- 모바일 전용 메뉴 버튼 추가
- 모바일 메뉴에 `aria-expanded`, `aria-controls` 적용
- 메뉴 링크 선택 시 모바일 메뉴 자동 닫힘
- `Esc` 키로 모바일 메뉴 닫기
- 현재 카테고리 메뉴에 `aria-current="page"` 적용
- 홈/게시판/게시글/개인정보처리방침을 동일한 반응형 디자인 시스템으로 통일
- 게시글 제목과 본문 글자 크기를 모바일에 맞게 조정
- Markdown 표를 모바일 가로 스크롤로 처리
- 긴 URL/코드/제목의 화면 밖 overflow 방지
- 이미지 최대 너비를 콘텐츠 영역에 맞춤
- KaTeX 수식의 모바일 가로 스크롤 지원
- PC 좌측 광고는 좁은 화면에서 숨기고 우측 광고는 콘텐츠 아래로 이동
- 카드와 버튼의 터치 영역을 모바일에서 충분히 확보
- 모바일에서 최신 글 사이드바를 본문 아래로 이동
- 중복된 `<title>`/`description` 메타를 index.html에서 정리
- `build-posts.js`가 생성하는 모든 카테고리/게시글 HTML도 같은 반응형 구조를 사용하도록 변경
- `taxSaving/260813-14md` 파일명을 `260813-14.md`로 수정하여 게시글 데이터에 정상 포함

## 빌드 확인

수정된 `build-posts.js`를 실행하여:

- Markdown 게시글 62개 발견
- 게시글 HTML 62개 생성
- 카테고리 HTML 5개 생성
- posts.json 생성
- sitemap.xml 69개 URL 생성

까지 정상 동작하는 것을 확인했다.

Vite 최종 번들은 이 실행 환경에서 Vite 8/Rolldown의 Linux native optional dependency가 누락되어 직접 빌드하지 못했다. 프로젝트 코드 자체의 JavaScript 문법 검사는 통과했다.

## 적용 방법

기존 프로젝트를 백업한 뒤 이 프로젝트의 파일로 교체한다.

의존성 설치 후:

```bash
bun install
bun run build
```

개발 서버:

```bash
bun run dev
```

Cloudflare Pages/Workers에서 기존과 동일하게 프로젝트의 build command를 사용하면 `build-posts.js`가 먼저 실행되어 게시글 HTML을 다시 생성한다.
