# CozyMoney 인증 기능 설정 안내

## 구현 범위

- 회원가입 요청과 이메일 인증 완료 후 계정 생성
- 이메일 인증 링크 재전송
- 이메일 인증이 완료된 계정만 로그인 허용
- HttpOnly 세션 쿠키, 세션 조회, 로그아웃
- 비밀번호 재설정 이메일과 일회용 재설정 링크
- 비밀번호 확인을 통한 계정 삭제
- 인증 요청별 IP 기반 요청 제한
- 비밀번호 원문 미저장, 인증·세션·재설정 토큰 해시 저장

## 로컬 개발

1. 의존성을 설치한다.
2. 로컬 D1 마이그레이션을 적용한다.
3. Pages 로컬 서버를 실행한다.

```powershell
bun install
bun run auth:local:migrate
bun run dev:pages
```

로컬 이메일 발송은 `AUTH_EMAIL_PROVIDER=log`로 설정된다. 이메일 발송 대신 Wrangler 터미널에 인증 URL이 출력된다. `wrangler.local.toml`은 로컬 개발 전용이며 운영 배포에 사용하지 않는다.

## Cloudflare Pages 운영 환경

Cloudflare Pages 프로젝트의 Functions 설정에서 D1 데이터베이스를 `D1_AUTH_DB`라는 바인딩 이름으로 연결한다. 운영 D1 데이터베이스에 `src/migrations/0001_authentication.sql`의 SQL을 적용한 다음 아래 환경 변수를 설정한다.

- `AUTH_SITE_URL=https://cozymoney.kr`
- `AUTH_EMAIL_PROVIDER=resend`
- `AUTH_EMAIL_API_KEY`: Resend API 키를 Secret으로 설정
- `AUTH_EMAIL_FROM`: Resend에서 인증된 발신 주소

환경 변수는 Preview와 Production 배포 환경에 각각 설정한다. 실제 API 키는 저장소나 일반 환경 변수 예시 파일에 커밋하지 않는다. 운영 환경에서 `log` 이메일 공급자를 사용하면 안 된다.

## 검증

```powershell
bun run check
bun run test
bun run build
```

인증 흐름 통합 테스트는 D1 SQL 동작을 모사하는 SQLite 테스트 데이터베이스를 사용하며, 실제 이메일이나 운영 D1 데이터베이스에 접근하지 않는다.
