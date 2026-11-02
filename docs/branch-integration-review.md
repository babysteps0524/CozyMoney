# CozyMoneyCalculator 브랜치 통합 검토 보고서

검토 기준일: 2026-11-02

## 1. 검토 범위

- `main` ZIP 스냅샷: 352개 파일, 압축 무결성 정상
- GitHub 저장소 브랜치: 27개 확인
- Pull Request: 총 50개 확인
- IPO 자동화 관련 PR #31~#46의 변경 내용 및 최신 IPO 브랜치 트리 비교
- 후보 통합 브랜치: `feat/ipo-v2-static-publishing`

이 보고서는 저장소 상태와 변경 방향을 요약한 것이다. 모든 브랜치의 모든 파일을 통합하거나 전체 테스트를 실행했다는 뜻은 아니다.

## 2. Main 기준 상태

`main`에는 계산기, 생활도구, AdSense 관련 페이지, 회원가입/로그인, Brevo 이메일, D1 문의 기능이 포함돼 있다. 반면 IPO 자동화 V2 코드와 IPO 전용 D1 migration은 `main`에 포함돼 있지 않다.

## 3. IPO 브랜치에서 확인한 기능

- OpenDART RSS 및 공시검색 수집
- 페이지 단위 수집, 재시도, 중복 제거
- DART 접수번호·원문 ZIP·XML 문서 식별 검증
- XML 표 구조와 근거 위치 보존
- IPO / SPAC / 유상증자 등 문서 목적 분류
- Evidence Pack과 사실별 근거 locator
- 지분증권 발행정보 API 기반 공모 사실 추출
- 근거 기반 AI 초안 생성 및 JSON/schema 검증
- Gemini → Groq → OpenRouter 서버 측 fallback
- 관리자 전용 초안 저장·편집·승인·반려 흐름
- 승인된 초안의 정적 게시 데이터 생성
- 관련 테스트와 운영 문서

## 4. 통합 후보와 주의사항

가장 후속 단계까지 포함한 후보는 `feat/ipo-v2-static-publishing`이다. 이 브랜치는 `main`보다 292개 커밋 앞서 있으며, AI 생성·초안 검토·정적 게시 관련 변경을 포함한다.

다만 그대로 병합하면 안 되는 항목이 확인됐다.

1. `public/ipo-feed.json`에 실제 공식 근거가 확인되지 않은 예시 기업·공모 정보가 포함돼 있다. 실제 데이터처럼 공개하면 안 되므로 제거하거나 명확한 테스트 전용 데이터로 분리해야 한다.
2. 해당 브랜치의 `wrangler.toml`은 Preview 인증 URL을 특정 기능 브랜치 주소로 변경한다. 운영 설정에 그대로 반영하면 안 된다.
3. `src/migrations/0003_ipo_v2_drafts.sql`이 추가된다. 관리자 초안 API를 배포하기 전에 Preview와 Production D1에 각각 마이그레이션을 적용해야 한다.
4. DART 및 AI API 키는 Cloudflare Pages Functions의 서버 측 Secret으로만 설정해야 한다. `.env.example`, 브라우저 번들, 로그, Git에는 실제 키를 넣지 않아야 한다.
5. AI 초안 생성은 자동 게시와 분리해야 한다. 원문 공시·정정 공시·공모 조건을 사람이 확인하고 승인한 콘텐츠만 정적 사이트에 반영해야 한다.
6. R2 아카이브 저장 PR #33은 닫혔고 병합되지 않았다. 따라서 이번 통합 후보에 R2 저장 기능이 완성돼 있다고 간주하면 안 된다.

## 5. 정리본에서 수행한 안전 조치

- `.wrangler`의 로컬 D1 SQLite 파일 및 캐시 제거
- `tmp-pages-test` 테스트 산출물 제거
- SQLite/DB 파일과 로컬 비밀 파일 제외
- `wrangler.toml`의 Production/Preview D1 ID를 자리표시자로 치환
- Preview `AUTH_SITE_URL`을 자리표시자로 치환
- 저장소 설정 및 문서의 실제 관리자 이메일을 예시 주소로 치환
- 실제 Cloudflare 환경에 맞게 설정해야 한다는 배포 안내 추가

## 6. 검증 제한

현재 실행 환경에는 Bun이 설치돼 있지 않아 `bun run verify`를 실행하지 못했다. 따라서 이 정리본은 소스 파일의 안전 정리본이며, 타입 검사·테스트·Astro 빌드가 통과했다고 주장하지 않는다.

또한 이 ZIP은 `main` 기반 정리본이다. IPO V2 브랜치의 모든 코드가 병합된 완성 통합본은 아니다. IPO 브랜치에는 위의 가짜 샘플 데이터, 배포 환경 의존성, D1 migration, AI API 비용·보안 검증이 남아 있어 이를 확인하지 않고 완성본으로 포장하지 않았다.
