# CozyMoneyCalculator — 회원가입 기능 추가 지시 프롬프트

## 목표

cozymoney.kr [https://cozymoney.kr] 에 **회원가입(Sign-up) 기능**을 추가한다.  
현재 사이트는 **순수 정적 SSG(Astro + Cloudflare Pages)** 이며, 계산기만 제공하는 구조다.  
회원가입을 위해 최소한의 서버 사이드 기능이 필요하므로, **기존 정적 구조와 AGENTS.md 규칙을 최대한 유지**하면서 확장한다.

---

## 절대 준수 규칙 (AGENTS.md 기반)

1. **main 브랜치 직접 수정 금지**
   - 반드시 새 브랜치를 생성해서 작업한다.
   - 예: `feature/auth-signup` 또는 `feature/user-registration`
   - 작업 전 `git status` 와 `git branch --show-current` 로 현재 브랜치를 확인한다.
   - main에 직접 push / merge 하지 않는다.

2. **기존 코드 구조를 임의로 대규모 변경하지 않는다**
   - 현재 디렉터리 구조, CalculatorPage / CalculatorShell, 공통 컴포넌트, UnoCSS Attributify, 순수 계산 로직 분리 방식을 최대한 유지한다.
   - 더 좋은 개선이 명확히 필요한 경우에만, 기존 패턴과 일관성 있게 최소한으로 개선한다.
   - React / Vue / Svelte 추가 금지.
   - 일반 CSS / SCSS 파일 새로 만들지 말 것 (UnoCSS + Attributify만 사용).
   - 불필요한 npm 패키지 추가 최소화.
   - SSR로 전면 전환하지 말 것. 정적 SSG를 기본으로 유지.

3. **기술 스택 유지**
   - Astro + TypeScript + Bun + UnoCSS (Attributify) + Cloudflare Pages
   - 계산 로직은 순수 함수로 유지 (`src/lib/calculators/`)
   - 클라이언트 JS는 필요한 최소 범위만 사용

4. **검증 필수**
   - 변경 후 반드시 실행:

     ```bash
     bun run check
     bun test
     bun run build
     ```

   - 오류를 숨기지 말고 수정한다.

---

## 현재 상태 분석 (작업 전 반드시 확인)

- 사이트: [https://cozymoney.kr] — 계산기 중심 정적 사이트
- 인증/회원 관련 기능 없음
- GitHub: [https://github.com/babysteps0524/CozyMoneyCalculator] (private 가능)
- 주요 구조 (README 기준):

  ```text
  src/
  ├── components/
  │   ├── calculators/
  │   ├── common/        # Header, Footer, AdSlot 등
  │   └── tools/
  ├── layouts/
  ├── lib/
  │   ├── calculators/
  │   └── seo/
  ├── pages/
  └── content/
  ```

- 배포: Cloudflare Pages (정적)
- 규칙 파일: AGENTS.md (매우 상세한 Codex 규칙 존재)

작업 시작 전 반드시 다음을 수행하라:

- 현재 branch 확인
- Header, Footer, BaseLayout, 공통 컴포넌트 코드 읽기
- package.json, astro.config, uno.config 확인
- 기존 라우팅 / SEO 패턴 확인

---

## 회원가입 기능 요구사항

### 핵심 기능

- 이메일 + 비밀번호 기반 회원가입
- (선택) 닉네임 / 이름 필드
- 이메일 중복 검사
- 비밀번호 강도 검증 (최소 길이, 복잡도)
- 회원가입 성공 후 로그인 상태 유지 또는 로그인 페이지로 리다이렉트
- 기본적인 에러 메시지 (한국어)
- 접근성(label, aria, keyboard) 준수
- 모바일 / 태블릿 / 데스크톱 반응형
- Dark mode 지원 (시스템 설정 따름)

### 추가 권장 기능 (우선순위 순)

1. 로그인 / 로그아웃
2. 비밀번호 재설정 (이메일 링크)
3. 이메일 인증 (선택)
4. 간단한 마이페이지 (닉네임 변경 정도)
5. 로그인 상태에 따른 Header UI 변경 (로그인 버튼 ↔ 사용자 메뉴)

### 비기능 요구사항

- 기존 계산기 페이지 성능/CLS에 영향 최소화
- 불필요한 클라이언트 JS 최소화
- SEO에 악영향 없도록 (회원가입 페이지는 noindex 고려 가능)
- AdSense 및 기존 광고 영역 유지
- 개인정보 최소 수집 원칙

---

## 기술 선택 가이드 (현재 구조에 최적)

현재가 **순수 정적 SSG + Cloudflare Pages** 이므로 아래 중 하나를 선택하라.  
**가장 권장하는 순서**:

### 1순위 (권장): Cloudflare 생태계 활용

- Cloudflare Pages Functions (또는 Workers)
- Cloudflare D1 (SQLite) 또는 KV / Durable Objects
- 또는 Cloudflare Access / 간단한 JWT + 쿠키 세션
- 비밀번호 해싱: Web Crypto 또는 가벼운 라이브러리 (bcrypt 계열은 번들 크기 주의)

### 2순위: 외부 Auth 서비스 (빠른 구현)

- Clerk, Auth0, Supabase Auth, Firebase Auth 등
- 단, 외부 스크립트/요청을 최소화하고, 기존 성능 규칙을 해치지 않는 방식으로 통합

### 3순위: 완전 커스텀

- 필요 시에만. 기존 규칙을 최대한 지키면서 구현

**금지/비권장**:

- 전면 SSR 전환
- 무거운 풀스택 프레임워크 추가
- 기존 계산기 컴포넌트에 인증 로직을 섞는 것

선택한 기술과 이유를 코드 주석 또는 PR 설명에 명확히 남겨라.

---

## 구현 방향 (구조 유지 + 최소 침습)

1. **새 페이지**
   - `/signup` 또는 `/auth/signup`
   - `/login` (필요 시)
   - 기존 pages 구조를 따른다.

2. **컴포넌트**
   - `src/components/common/` 또는 `src/components/auth/` 에 회원가입/로그인 폼 컴포넌트 추가
   - Header에 로그인/회원가입 링크 또는 사용자 메뉴 추가 (기존 Header 패턴 유지)

3. **로직 분리**
   - 인증 관련 유틸은 `src/lib/auth/` 등에 순수하게 분리
   - UI와 비즈니스 로직을 최대한 분리

4. **스타일**
   - UnoCSS Attributify만 사용
   - 기존 버튼, 입력 필드, 카드 스타일과 일관성 유지
   - +/- 버튼, 결과 카드 등 기존 UX 패턴을 참고

5. **실시간 검증**
   - 이메일 형식, 비밀번호 강도 등은 input 이벤트로 즉시 피드백 가능하면 적용
   - 기존 live calculation 패턴을 참고하되, 인증 폼에 맞게 단순하게 구현

6. **보안**
   - 비밀번호는 절대 평문 저장 금지
   - CSRF, XSS 기본 방어
   - HTTPS 강제 (Cloudflare에서 처리)
   - rate limiting 고려 (Functions에서)

7. **SEO / 메타**
   - 회원가입 페이지에 적절한 title, description 작성
   - 필요 시 robots noindex

---

## 작업 순서 (반드시 이 순서를 따를 것)

1. 현재 브랜치 확인 → main이면 새 feature 브랜치 생성
2. 기존 코드 구조 분석 (Header, Layout, pages, lib, 공통 컴포넌트)
3. 기술 선택 결정 및 간단한 설계 문서화 (코드 주석 또는 별도 md)
4. 인증 백엔드/API 최소 구현
5. 회원가입 UI 컴포넌트 + 페이지 작성
6. Header 연동
7. 에러 처리, 접근성, 반응형 확인
8. 테스트 작성 (가능한 범위)
9. `bun run check` → `bun test` → `bun run build`
10. git status / git diff 로 변경 범위 확인
11. 커밋 (의미 있는 커밋 메시지)
12. (사용자가 요청할 때까지) main에 머지하지 않음

---

## 커밋 메시지 예시

```
feat: add email/password signup with Cloudflare Pages Functions
feat: add login page and session handling
refactor: extract auth utilities to src/lib/auth
fix: improve signup form accessibility and validation
```

---

## 완료 기준

- 회원가입이 실제로 동작한다 (이메일+비밀번호)
- 기존 계산기 페이지가 깨지지 않는다
- 기존 UI/UX 패턴과 일관성이 유지된다
- `bun run check`, `bun test`, `bun run build` 통과
- main 브랜치를 직접 건드리지 않았다
- AGENTS.md의 금지 사항을 위반하지 않았다
- 변경 내용, 검증 결과, 남은 이슈를 명확히 보고한다

---

## 추가 지시

- 불확실한 부분은 추측하지 말고, 기존 코드와 AGENTS.md를 우선 따른다.
- 계산 공식이나 기존 계산기 로직은 절대 변경하지 않는다.
- 광고, SEO metadata, dark mode, 반응형 규칙을 해치지 않는다.
- 작업이 끝나면 변경한 파일 목록, 선택한 기술, 검증 결과, 다음에 필요한 작업을 요약해서 보고한다.

이 프롬프트를 정확히 따르면서, 현재 CozyMoneyCalculator의 철학(정적, 가볍고, 유지보수하기 쉬운 구조)을 해치지 않는 회원가입 기능을 구현하라.
