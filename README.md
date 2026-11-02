# CozyMoneyCalculator

생활·금융·세금·급여·부동산 계산기를 제공하는 [cozymoney.kr](https://cozymoney.kr) 정적 웹사이트입니다. 한국어 페이지를 Astro로 생성하며 Cloudflare Pages 배포를 기준으로 구성합니다.

## 기술 스택

- Astro와 TypeScript
- Bun 패키지 관리자와 테스트 러너
- UnoCSS, Attributify, OKLCH 색상 토큰
- Astro Static Site Generation (SSG)
- Cloudflare Pages
- Cloudflare D1 (인증 및 문의 데이터베이스)
- Brevo (이메일 발송)

## 시작하기

Bun이 필요합니다.

```sh
bun install
bun run dev
```

개발 서버는 Astro 기본 주소인 `http://localhost:4321`에서 실행됩니다.

## 명령어

| 명령어                          | 설명                                                       |
| ------------------------------- | ---------------------------------------------------------- |
| `bun run dev`                   | 로컬 개발 서버 실행                                        |
| `bun run check`                 | `astro check`와 `tsc --noEmit` 실행                        |
| `bun run test`                  | Bun 테스트 실행                                            |
| `bun run build`                 | 정적 사이트 빌드 후 sitemap 산출물 검증                    |
| `bun run verify:sitemap`        | 빌드된 sitemap, robots.txt, 이전 sitemap URL 리디렉션 검증 |
| `bun run preview`               | 빌드 결과 로컬 미리보기                                    |
| `bun run dev:pages`             | 정적 빌드 후 Wrangler Pages 로컬 미리보기                  |
| `bun run verify`                | 검사, 테스트, 빌드 및 sitemap 검증 순서로 실행             |
| `bun run format`                | Astro 파일 Prettier 포맷                                   |
| `bun run auth:local:migrate`    | 로컬 D1 인증 DB에 마이그레이션 적용                        |
| `bun run auth:local:migrations` | 로컬 D1 인증 DB 마이그레이션 목록 조회                     |

## 디렉터리 구조

```text
src/
├── components/
│   ├── calculator/   # 계산기 공통 UI 프레임 (CalculatorPage, CalculatorShell 등)
│   ├── common/       # Header, Footer, AdSlot 등 공통 UI
│   ├── shared/       # 공용 UI 컴포넌트
│   └── tool/         # 생활 도구 UI 공통 컴포넌트
├── layouts/          # BaseLayout 및 공통 문서 구조
├── lib/
│   ├── calculator/   # 계산기 순수 함수, 입력 처리, 실시간 계산 runtime
│   ├── email/        # 이메일 발송 모듈과 템플릿 (send.ts, templates.ts)
│   ├── seo/          # SEO 관련 유틸리티
│   └── tool/         # 도구 공통 타입과 런타임
├── migrations/       # D1 데이터베이스 마이그레이션 SQL
│   ├── 0001_authentication.sql
│   └── 0002_inquiries.sql
├── pages/
│   ├── calculators/  # 계산기 페이지
│   ├── tools/        # 생활 도구 페이지
│   ├── contact/      # 문의 접수 페이지
│   ├── admin/        # 관리자 페이지 (문의 관리 등)
│   ├── auth/         # 인증 페이지 (로그인, 회원가입, 비밀번호 재설정 등)
│   ├── contact/      # 문의하기 페이지
│   └── privacy/      # 개인정보처리방침
└── content/          # 페이지 콘텐츠 자료

functions/
├── api/
│   ├── auth/         # 인증 API (signup, login, forgot-password, reset-password, verify-email 등)
│   ├── contact/      # 문의 접수 API (inquiry)
│   ├── admin/        # 관리자 API (문의 목록, 답변 전송 등)
│   ├── _email.ts     # 이메일 발송 공통 함수 (Brevo)
│   ├── _email-templates.ts  # 이메일 템플릿 (문의 접수, 알림, 답변 등)
│   └── auth/_shared.ts      # 인증 공통 유틸리티 (D1, 세션, 이메일 발송, 레이트 리미팅)

public/
├── _redirects          # Cloudflare Pages URL 리디렉션 규칙
├── ads.txt             # AdSense 게시자 정보
└── favicon.svg         # 사이트 아이콘

scripts/
└── verify-sitemap.ts   # 빌드 sitemap/robots 산출물 검증

tests/                  # Bun 테스트
```

계산기 페이지는 공통 `CalculatorPage` 프레임을 사용하고, 계산기 입력·결과 UI는 계산기별 Astro 컴포넌트에 둡니다. 계산 공식은 가능한 한 `src/lib/calculators`에 순수 TypeScript 함수로 분리합니다. 페이지에 이미 별도 설명 UI가 있는 경우 공통 프레임 안에 그대로 유지합니다.

## Sitemap 및 robots.txt

Astro의 `@astrojs/sitemap` 통합이 빌드 시 다음 파일을 생성합니다. 확인

- `/sitemap-index.xml`: 검색엔진에 제출할 sitemap 인덱스
- `/sitemap-0.xml` 등: 실제 페이지 URL을 담은 sitemap 파일
- `/robots.txt`: `src/pages/robots.txt.ts`에서 생성하며 sitemap 인덱스를 가리킴

기존에 사용하던 `/sitemap.xml` 주소는 Cloudflare Pages의 `public/_redirects`에서 `/sitemap-index.xml`로 영구 리디렉션합니다. 새로 등록할 때는 표준 주소인 [https://cozymoney.kr/sitemap-index.xml](https://cozymoney.kr/sitemap-index.xml)을 사용합니다.

빌드 과정은 sitemap 인덱스와 그 안에서 참조하는 sitemap 파일, robots.txt의 sitemap URL, 리디렉션 규칙을 자동으로 검사합니다. 이 검사는 빌드 산출물의 일관성을 확인하며, 배포 후 실제 HTTP 응답이나 Google 색인 여부까지 보장하지는 않습니다.

## 광고 환경 변수

광고를 사용할 때 프로젝트 루트의 `.env.example`을 참고해 로컬 `.env`와 Cloudflare Pages 환경 변수에 값을 설정합니다.

- `PUBLIC_ADSENSE_CLIENT`: AdSense 게시자 ID
- `PUBLIC_ADSENSE_SLOT_CALCULATOR`: 계산기 광고 슬롯 ID
- `PUBLIC_ADSENSE_SLOT_TOOL`: 생활 도구 광고 슬롯 ID
- `PUBLIC_ADSENSE_SLOT_HOME_MID`: 홈페이지 중간 광고 슬롯 ID
- `PUBLIC_ADSENSE_SLOT_LIST_MID`: 계산기 목록 중간 광고 슬롯 ID

실제 게시자 ID와 슬롯 ID는 저장소에 커밋하지 마세요. 광고 설정이 없으면 광고 영역은 렌더링되지 않습니다.

## 인증 및 이메일 환경 변수

인증과 이메일 발송에 필요한 환경 변수를 Cloudflare Pages 대시보드 또는 로컬 `.env`에 설정합니다.

| 변수                  | 타입          | 설명                               | 예시                      |
| --------------------- | ------------- | ---------------------------------- | ------------------------- |
| `AUTH_SITE_URL`       | `plain_text`  | 사이트 기준 URL                    | `https://cozymoney.kr`    |
| `AUTH_EMAIL_PROVIDER` | `plain_text`  | 이메일 제공자 (`log` 또는 `brevo`) | `log` 또는 `brevo`        |
| `AUTH_SESSION_SECRET` | `secret_text` | 세션 암호화 비밀키                 | 임의 문자열               |
| `BREVO_API_KEY`       | `secret_text` | Brevo API 키                       | `xkeysib-...`             |
| `BREVO_FROM_EMAIL`    | `plain_text`  | 인증된 발신 이메일 주소            | `no-reply@cozymoney.kr`   |
| `BREVO_FROM_NAME`     | `plain_text`  | 발신자 이름                        | `CozyMoney 코지머니`      |
| `ADMIN_EMAIL`         | `plain_text`  | 문의 알림 수신자 이메일            | `admin@example.com` |
| `PUBLIC_SITE_URL`     | `plain_text`  | 클라이언트용 사이트 URL            | `https://cozymoney.kr`    |

`AUTH_EMAIL_PROVIDER`가 `log`이면 로컬 콘솔에 인증/재설정 URL을 출력합니다. `brevo`이면 Brevo API로 이메일을 발송하며, `BREVO_API_KEY`와 `BREVO_FROM_EMAIL`이 설정되어 있어야 합니다. 발신 주소는 Brevo에서 인증된 주소여야 합니다.

실제 비밀값은 저장소에 커밋하지 마세요. `.env.example`을 참고하세요. 이 배포용 정리본에서는 개인정보와 Cloudflare D1 ID를 예시값으로 치환했으므로, 실제 Cloudflare 프로젝트에 맞게 `wrangler.toml`과 환경변수를 설정해야 합니다.

## 문의 시스템

사용자가 `/contact/` 페이지에서 문의를 접수할 수 있습니다.

- 접수된 문의는 D1 `inquiries` 테이블에 저장됩니다.
- 사용자에게 접수 확인 이메일이 발송됩니다.
- 관리자에게 새 문의 알림 이메일이 발송됩니다.
- 관리자는 `/admin/inquiries/` 페이지에서 문의 목록을 조회하고 답변을 작성·전송할 수 있습니다.
- 답변이 전송되면 사용자에게 답변 이메일이 발송됩니다.

이메일 템플릿은 외부 템플릿 ID를 사용하지 않고 코드 안에 HTML로 직접 정의합니다(`src/lib/email/templates.ts`, `functions/api/_email-templates.ts`). 따라서 이메일 서비스 대시보드에서 템플릿 ID를 찾을 필요 없이 코드를 수정하면 이메일 내용을 바로 변경할 수 있습니다.

## 스타일 및 페이지 원칙

- UI 프레임워크를 추가하지 않고 Astro 컴포넌트와 필요한 브라우저 스크립트를 사용합니다.
- 스타일은 프로젝트 UnoCSS 토큰과 Attributify 규칙을 따릅니다.
- 계산기는 입력 검증, 키보드 접근성, 다크 모드, 모바일·태블릿·데스크톱 레이아웃을 고려합니다.
- 페이지별 title, description, canonical을 지정합니다.
- 계산 기준과 참고용 결과의 한계를 페이지 콘텐츠에 명확히 씁니다.
- 정적 출력과 낮은 클라이언트 JavaScript를 유지합니다.

## 데이터베이스 마이그레이션

인증과 문의 기능은 Cloudflare D1을 사용합니다. 마이그레이션 파일은 `src/migrations/`에 있습니다.

- `0001_authentication.sql`: 사용자, 세션, 비밀번호 재설정 토큰, 레이트 리미팅 테이블
- `0002_inquiries.sql`: 문의 접수 테이블

로컬에서 마이그레이션을 적용하려면:

```sh
bun run auth:local:migrate
```

## 배포

Astro 정적 빌드 결과인 `dist/`를 Cloudflare Pages에 배포합니다. 배포 환경의 빌드 명령은 `bun run build`, 출력 디렉터리는 `dist`로 설정합니다.

Cloudflare Pages에 푸시하면 Functions(`/functions/api/`)도 함께 배포되며, 환경 변수는 Cloudflare Pages 대시보드의 **Settings → Environment variables**에서 관리합니다.

`bun.lock`은 Cloudflare Pages의 bun 버전과 호환성을 위해 저장소에 커밋하지 않습니다(`.gitignore`에 등록). 각 환경에서 `bun install` 실행 시 자동으로 생성됩니다.


## 배포 전 필수 설정

이 정리본은 실제 계정 식별정보와 Cloudflare 리소스 ID를 포함하지 않도록 구성했습니다.

1. `wrangler.toml`의 Production 및 Preview `database_id`를 각각 실제 D1 데이터베이스 ID로 교체합니다.
2. Preview의 `AUTH_SITE_URL`을 실제 Preview 배포 주소로 교체합니다.
3. `.env.example`을 참고해 로컬 `.dev.vars` 및 `.env`를 직접 생성합니다.
4. Cloudflare Pages의 Production과 Preview 환경에 각각 D1 바인딩과 환경변수/Secret을 등록합니다.
5. 실제 관리자 이메일은 `ADMIN_EMAIL` 환경변수에 등록합니다.
6. `bun run verify`를 통과한 후 Preview에서 인증·문의 기능을 검증합니다.

`wrangler.toml`의 `00000000-0000-0000-0000-000000000000`은 자리표시자이며 실제 D1 ID가 아닙니다.
