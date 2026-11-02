# 인증 기능 로컬 통합 테스트

이 안내는 `feature/user-authentication` 브랜치의 Cloudflare Pages Functions와 D1을 **로컬에서만** 검증하기 위한 절차다.

## 안전 범위

- `wrangler.local.toml`은 로컬 테스트 전용 설정이다.
- 이 설정의 D1 ID는 로컬용 자리표시자다. 운영 D1 데이터베이스를 만들거나 연결하지 않는다.
- `auth:local:migrate` 명령에는 `--local`이 포함되어 있어 로컬 D1에만 마이그레이션을 적용한다.
- `AUTH_EMAIL_PROVIDER = "log"`는 실제 이메일을 보내지 않는다. 인증 토큰은 로컬 Wrangler 터미널 로그에 출력된다.
- 이 설정으로 운영 배포하지 않는다. 운영 환경 연결은 별도 검토 후 진행한다.

## 실행 순서

프로젝트 루트에서 실행한다.

```powershell
bun install
bun run auth:local:migrate
bun run auth:local:migrations
bun run dev:pages
```

마이그레이션 목록에 `0001_initial_schema.sql`이 적용된 것으로 표시되는지 확인한다. 마지막 명령은 Astro 정적 빌드를 만든 뒤 Pages Functions를 `http://127.0.0.1:8788`에서 실행한다. Pages 개발 서버는 사용자 지정 `--config wrangler.local.toml` 경로를 지원하지 않으므로, 스크립트는 프로젝트 루트의 기본 `wrangler.toml`을 자동 탐색하게 하고 `--d1 D1_AUTH_DB=00000000-0000-4000-8000-000000000001` 옵션으로 로컬 D1 바인딩을 덮어쓴다. 이 ID는 `wrangler.local.toml`의 로컬 자리표시자와 일치해야 한다.

## 기본 확인

다른 PowerShell 창에서 다음을 확인한다.

```powershell
curl.exe -I http://127.0.0.1:8788/signup/
curl.exe -I http://127.0.0.1:8788/login/
curl.exe -I http://127.0.0.1:8788/verify-email/
curl.exe -i -X POST http://127.0.0.1:8788/api/auth/signup -H "Content-Type: application/json" -d "{}"
```

페이지 요청은 `200`, 마지막 잘못된 회원가입 요청은 검증 오류 `400` 응답이 예상된다. 이 검사는 라우트가 실행되는지 확인하는 스모크 테스트이며, 전체 인증 흐름의 성공을 보장하지는 않는다.

## 회원가입부터 이메일 인증까지

1. `http://127.0.0.1:8788/signup/`에서 테스트용 이메일과 비밀번호로 가입한다.
2. Wrangler 터미널에서 `[EMAIL]` 로그를 확인한다. 실제 이메일은 발송되지 않는다.
3. 로그의 토큰을 복사해 로컬 주소 `http://127.0.0.1:8788/verify-email/?token=토큰`을 연다. 로그에 출력되는 URL이 운영 도메인으로 표시될 수 있으므로, 로컬 테스트에서는 주소의 호스트를 `127.0.0.1:8788`로 바꾼다.
4. 인증 완료 메시지를 확인한 뒤 로그인한다.
5. 로그인 후 `/api/auth/session` 응답과 로그아웃 후 세션 무효화를 확인한다.

## 결과 기록

아래 항목을 확인한 뒤 `bun run verify`를 다시 실행한다.

- [ ] 로컬 D1 마이그레이션 적용
- [ ] Pages Functions 서버 시작
- [ ] 잘못된 회원가입 요청의 400 응답
- [ ] 회원가입 및 인증 토큰 생성
- [ ] 이메일 인증 성공 및 재사용 토큰 거부
- [ ] 인증 전 로그인 차단, 인증 후 로그인 성공
- [ ] 세션 확인 및 로그아웃
- [ ] 비밀번호 재설정 토큰 만료·재사용 처리

이 절차에서 실제 이메일 발송, 원격 D1, 운영 배포는 검증하지 않는다.
