# CozyMoneyCalculator Codex Rules

## 1. 프로젝트 기본 정보

프로젝트명: CozyMoneyCalculator
서비스: <https://cozymoney.kr>
GitHub 저장소: <https://github.com/babysteps0524/CozyMoneyCalculator>
주요 목적: 생활·금융·세금·급여·부동산 등의 계산기를 제공하는 정적 웹사이트

이 프로젝트는 다음 기술 스택을 사용한다.

- Astro
- TypeScript
- Bun
- UnoCSS
- UnoCSS Attributify
- GitHub
- Cloudflare Pages
- Static Site Generation(SSG)

프로젝트의 기본 방향은 다음과 같다.

- 계산기 중심 웹사이트
- 빠른 초기 렌더링
- 모바일 우선이 아니라 모바일/태블릿/PC 각각을 고려한 반응형 UI
- SEO 친화적인 정적 HTML
- Google AdSense를 고려한 콘텐츠 구조
- 접근성 및 사용성 고려
- 계산 결과의 정확성
- 계산기별 기능의 일관성
- 불필요한 JavaScript 최소화
- 불필요한 외부 요청 최소화
- 유지보수하기 쉬운 컴포넌트 구조

---

## 2. 절대적으로 지켜야 하는 기술 스택 규칙

### Astro

이 프로젝트의 UI와 페이지는 Astro를 기본으로 한다.

새로운 페이지나 컴포넌트를 만들 때 React, Vue, Svelte 등의 UI 프레임워크를 임의로 추가하지 않는다.

기본적으로 다음 구조를 우선한다.

- `.astro` 컴포넌트
- `.ts` 계산 로직
- Astro의 server-side/frontmatter 로직
- 필요한 경우에만 `<script>`를 통한 클라이언트 JavaScript

Astro의 장점을 유지하기 위해 불필요한 클라이언트 hydration을 추가하지 않는다.

가능하면 정적 HTML을 우선 생성한다.

---

## 3. TypeScript 규칙

모든 계산 로직은 가능한 한 TypeScript로 작성한다.

계산 함수에는 명확한 입력 타입과 반환 타입을 사용한다.

예:

```ts
export interface LoanInput {
  principal: number;
  annualRate: number;
  months: number;
}

export interface LoanResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
}

export function calculateLoan(input: LoanInput): LoanResult {
  // ...
}
```

다음 사항을 지킨다.

- `any` 사용을 피한다.
- 타입을 추론할 수 있는 경우 불필요한 타입 선언을 반복하지 않는다.
- public component props에는 명확한 타입을 사용한다.
- 계산 결과의 타입을 명확하게 정의한다.
- 문자열과 숫자를 혼용하지 않는다.
- 사용자 입력값은 DOM에서 읽은 후 명확하게 숫자로 변환한다.
- `null`과 `undefined` 가능성을 고려한다.
- 사용하지 않는 import, 변수, 함수는 남기지 않는다.
- TypeScript 오류를 숨기기 위해 `@ts-ignore`를 사용하지 않는다.
- `as any`로 타입 오류를 우회하지 않는다.
- 타입 오류가 발생하면 근본 원인을 수정한다.

Astro 프로젝트의 타입 검사는 `astro check`를 중요하게 취급한다.

---

## 4. Bun 규칙

패키지 관리 및 프로젝트 명령은 Bun을 기준으로 한다.

가능하면 npm, yarn, pnpm을 사용하지 않는다.

기본 명령:

```bash
bun install
bun run dev
bun run build
bun run check
bun test
```

의존성 추가:

```bash
bun add <package>
```

개발 의존성:

```bash
bun add -d <package>
```

임의로 package manager를 변경하지 않는다.

`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml` 등을 새로 생성하지 않는다.

프로젝트의 기존 `bun.lock`을 유지한다.

Bun을 사용하더라도 브라우저에서 실행되는 코드는 일반적인 Web API를 우선 사용한다.

---

## 5. UnoCSS 규칙

이 프로젝트는 UnoCSS를 사용한다.

### 매우 중요한 규칙

일반 CSS를 작성하지 않는다.

다음 파일을 새로 만들어 일반 CSS로 스타일링하지 않는다.

```text
.css
.scss
.sass
.less
```

특히 다음과 같은 방식을 사용하지 않는다.

```html
<style>
  .button {
    color: red;
  }
</style>
```

스타일은 기본적으로 UnoCSS utility와 Attributify 문법으로 작성한다.

예:

```astro
<div flex="~" items-center justify-between gap-4>
```

```astro
<button
  px="4"
  py="2"
  rounded="lg"
  bg="blue-600"
  text="white"
  hover="bg-blue-700"
  active="scale-98"
>
  계산하기
</button>
```

UnoCSS Attributify를 적극적으로 사용한다.

---

## 6. UnoCSS 디자인 규칙

프로젝트의 기존 UnoCSS 설정과 theme, shortcuts, colors를 우선 사용한다.

이미 존재하는 shortcut이 있다면 동일한 UI를 새로 utility 조합으로 만들기보다 기존 shortcut을 재사용한다.

반대로 단순한 1회성 스타일을 위해 불필요한 shortcut을 만들지 않는다.

새로운 shortcut이 필요하다면 다음 조건을 만족해야 한다.

- 여러 컴포넌트에서 반복 사용될 것
- 의미가 명확할 것
- 기존 shortcut과 중복되지 않을 것

색상은 프로젝트의 기존 디자인 시스템을 우선한다.

OKLCH 기반 색상 체계를 유지한다.

임의의 색상을 추가하지 않는다.

---

## 7. 반응형 UI 규칙

모든 UI는 다음 세 환경을 고려한다.

- 모바일
- 태블릿
- 데스크톱

단순히 데스크톱 UI를 축소하는 방식으로 만들지 않는다.

화면 크기에 따라 다음을 독립적으로 검토한다.

- 입력 필드 크기
- 버튼 크기
- 버튼 배치
- 결과 영역
- 카드 폭
- 텍스트 크기
- 여백
- grid/column 구조
- 광고 영역
- 표(table)의 가독성

모바일에서 가로 스크롤이 발생하지 않도록 한다.

터치 환경에서 버튼과 입력 영역을 충분히 크게 유지한다.

hover 상태만으로 중요한 정보를 전달하지 않는다.

hover와 active 상태를 가능한 경우 모두 제공한다.

---

## 8. Dark Mode 규칙

Dark Mode는 사용자의 시스템 설정을 따른다.

사용자에게 별도의 테마 선택 UI를 추가하지 않는다.

기본적으로:

- light system preference → light UI
- dark system preference → dark UI

UnoCSS의 dark variant를 사용한다.

예:

```astro
<div
  bg="white dark:gray-900"
  text="gray-900 dark:gray-100"
>
```

라이트/다크 모드에서 모두 충분한 대비를 유지한다.

---

## 9. 폰트 규칙

프로젝트의 기본 폰트는 Pretendard 계열을 사용한다.

새로운 외부 폰트를 임의로 추가하지 않는다.

폰트 파일의 크기를 고려한다.

대용량 폰트를 무조건 전체 로딩하지 않는다.

가능하면 subset/dynamic subset 등의 방법으로 초기 전송량을 줄인다.

---

## 10. 컴포넌트 구조

공통 UI와 계산기별 UI를 분리한다.

권장 구조:

```text
src/
├─ components/
│  ├─ common/
│  ├─ calculators/
│  └─ layout/
├─ layouts/
├─ lib/
│  └─ calculators/
└─ pages/
   └─ calculators/
```

계산기 페이지에 계산 로직을 전부 직접 작성하지 않는다.

가능하면 다음과 같이 분리한다.

```text
페이지
 ↓
계산기 페이지 공통 구조
 ↓
계산기 UI 컴포넌트
 ↓
계산 로직
```

예:

```text
src/pages/calculators/loan/index.astro
src/components/calculators/LoanCalculator.astro
src/lib/calculators/loan.ts
```

---

## 11. CalculatorPage / CalculatorShell 구조

현재 프로젝트에서 사용하는 공통 구조를 유지한다.

페이지 공통 구조:

```text
CalculatorPage
    └─ CalculatorShell
          ├─ calculator component
          ├─ advertisement
          ├─ explanation
          ├─ formula
          ├─ basis
          └─ cautions
```

`CalculatorPage.astro`는 다음과 같은 공통 책임을 담당한다.

- BaseLayout
- Header
- breadcrumb
- 페이지 제목
- 페이지 설명
- CalculatorShell
- Footer

`CalculatorShell.astro`는 계산기 공통 콘텐츠 구조를 담당한다.

특정 계산기의 계산 로직이나 입력 필드를 CalculatorShell에 다시 넣지 않는다.

CalculatorShell을 거대한 조건문/switch 문으로 되돌리지 않는다.

---

## 12. 계산기별 컴포넌트 규칙

각 계산기는 가능한 한 독립된 컴포넌트를 가진다.

예:

```text
LoanCalculator.astro
DsrCalculator.astro
DtiCalculator.astro
PercentageCalculator.astro
VatCalculator.astro
PropertyTaxCalculator.astro
```

계산기별 컴포넌트는 다음을 담당할 수 있다.

- 입력 UI
- 입력값 처리
- +/- 버튼
- 계산 실행
- 결과 표시
- 복사
- 초기화
- 계산기별 상태

공통 UI는 공통 컴포넌트를 재사용한다.

---

## 13. 계산 로직 규칙

계산 로직과 UI 로직을 가능한 한 분리한다.

복잡한 계산 공식은 `.astro` 파일에 길게 작성하지 않는다.

가능하면:

```text
src/lib/calculators/
```

에 계산 함수를 둔다.

예:

```ts
export function calculateDti(income: number, debtPayment: number): number {
  return (debtPayment / income) * 100;
}
```

계산 함수는 가능하면 순수 함수로 작성한다.

즉:

- DOM을 직접 조작하지 않는다.
- document를 참조하지 않는다.
- window를 참조하지 않는다.
- 전역 상태에 의존하지 않는다.
- 같은 입력이면 같은 결과를 반환한다.

---

## 14. 계산기 입력 규칙

금액 입력은 사용자가 입력하는 동안 읽기 쉽게 표시한다.

가능하면 천 단위 콤마를 적용한다.

예:

```text
1000000
```

→

```text
1,000,000
```

단, 계산 함수에는 문자열이 아니라 숫자를 전달한다.

입력값 처리와 표시값 처리를 명확히 구분한다.

---

## 15. 입력하면서 바로 계산

사용자가 값을 입력할 때 결과가 즉시 갱신될 수 있는 계산기는 실시간 계산을 지원한다.

가능하면:

```text
input
```

이벤트를 사용한다.

필요한 경우:

```text
change
```

도 사용한다.

프로젝트에 이미 존재하는 공통 live calculation runtime/helper가 있다면 그것을 우선 사용한다.

예:

```ts
bindLiveCalculation(root, calculate);
```

동일한 이벤트 listener를 계산기마다 중복 작성하지 않는다.

---

## 16. 실시간 계산의 예외

다음 경우에는 무조건 실시간 계산을 강제하지 않는다.

- 입력 중간 상태가 유효한 숫자가 아닌 경우
- 계산 비용이 매우 큰 경우
- 입력 완료 후 계산하는 것이 UX상 더 적절한 경우
- 사용자가 명시적으로 계산 버튼을 눌러야 하는 계산기

그러나 단순한 계산기는 가능한 한 입력 즉시 결과가 변경되도록 한다.

예:

- 퍼센트
- 시급
- 주급
- 월급
- DTI
- DSR
- 이자 계산
- 자동차세
- 임대료 관련 계산
- 단순 세율 계산

---

## 17. 입력값 검증

사용자 입력을 신뢰하지 않는다.

다음 상황을 처리한다.

- 빈 값
- 0
- 음수
- 숫자가 아닌 값
- 지나치게 큰 값
- 소수
- 잘못된 날짜
- 최소/최대 범위 초과

계산 공식에서 의미가 없는 값을 허용하지 않는다.

다만 사용자의 입력 경험을 방해하지 않도록 입력 중간 상태는 적절히 허용한다.

---

## 18. +/- 버튼 규칙

금액/기간/비율 등에 +/- 버튼이 있는 계산기는 기존 프로젝트의 버튼 스타일과 동작 방식을 유지한다.

가능하면:

```text
[-] [입력값] [+]
```

형태를 사용한다.

버튼은 키보드와 터치에서 모두 사용 가능해야 한다.

버튼에는 명확한 `aria-label`을 제공한다.

예:

```astro
aria-label="금액 줄이기"
```

```astro
aria-label="금액 늘리기"
```

---

## 19. 계산 결과 UX

계산 결과는 사용자가 가장 쉽게 확인할 수 있어야 한다.

결과 영역은 입력 영역과 명확하게 구분한다.

금액은 천 단위 콤마를 사용한다.

가능하면 주요 결과를 가장 먼저 보여준다.

예:

```text
월 상환금
1,234,567원
```

보조 결과:

```text
총 상환액
총 이자
```

---

## 20. 초기화 기능

계산기에 초기화 버튼이 있다면 모든 사용자 입력값을 초기 상태로 되돌린다.

초기화 후 결과도 초기 상태로 되돌린다.

가능하면 기존 프로젝트에서 사용하는 toast UX를 유지한다.

예:

```text
초기화되었습니다.
```

레이아웃이 갑자기 움직이지 않도록 한다.

---

## 21. 복사 기능

복사 버튼을 제공하는 경우 Clipboard API를 사용한다.

복사 성공 시 사용자가 성공 여부를 알 수 있도록 한다.

예:

```text
복사되었습니다.
```

민감한 정보가 아닌 계산 결과만 복사한다.

Clipboard API가 지원되지 않는 경우를 고려한다.

---

## 22. Layout Shift 방지

CLS를 매우 중요하게 취급한다.

다음 요소 때문에 레이아웃이 갑자기 움직이지 않도록 한다.

- 광고
- 이미지
- 폰트
- 계산 결과
- 동적으로 생성되는 입력 필드
- toast
- 표
- 설명 영역

광고 영역은 사전에 공간을 확보한다.

이미지는 가능하면 width/height 또는 aspect ratio를 지정한다.

동적 결과 영역도 가능한 경우 최소 높이를 확보한다.

---

## 23. JavaScript 최소화

이 프로젝트는 Astro SSG를 사용하므로 브라우저 JavaScript를 최소화한다.

단순한 정적 콘텐츠에 JavaScript를 추가하지 않는다.

계산기처럼 실제 상호작용이 필요한 부분에만 client-side JavaScript를 사용한다.

다음과 같은 방식은 피한다.

- 전체 페이지를 JS로 렌더링
- 정적 HTML을 불필요하게 innerHTML로 재생성
- 거대한 전역 JavaScript
- 모든 페이지에서 공통으로 로딩되는 계산기 JS
- 사용하지 않는 라이브러리

---

## 24. innerHTML 사용 규칙

가능하면 `innerHTML`을 사용하지 않는다.

특히 입력할 때마다 전체 계산기 DOM을 `innerHTML`로 다시 생성하는 방식은 피한다.

이유:

- 포커스 손실
- 입력 커서 위치 변경
- CLS
- 불필요한 DOM 재생성
- 이벤트 listener 관리 문제
- 접근성 문제

기존 코드에 innerHTML이 있다면 무조건 한 번에 전체를 바꾸지 말고, 변경 범위를 최소화하는 방향을 우선 검토한다.

---

## 25. 이벤트 listener 규칙

이벤트 listener를 중복 등록하지 않는다.

다음과 같은 중복을 피한다.

```ts
root.addEventListener('input', calculate);
bindLiveCalculation(root, calculate);
```

공통 runtime/helper를 사용한다면 직접 같은 이벤트를 다시 등록하지 않는다.

컴포넌트가 재실행될 가능성이 있는 경우 cleanup도 고려한다.

---

## 26. DOM 접근 규칙

DOM element를 가져올 때 null 가능성을 고려한다.

예:

```ts
const input = form.querySelector<HTMLInputElement>('#amount');

if (!input) {
  return;
}
```

가능하면 적절한 generic 타입을 사용한다.

```ts
querySelector<HTMLInputElement>();
```

---

## 27. Accessibility

모든 계산기는 접근성을 고려한다.

필수적으로 고려할 항목:

- label
- aria-label
- button type
- keyboard interaction
- focus
- 충분한 색상 대비
- 오류 메시지
- 결과 영역의 의미 있는 구조

placeholder를 label의 대체 수단으로 사용하지 않는다.

아이콘만 있는 버튼에는 `aria-label`을 제공한다.

---

## 28. SEO

각 계산기 페이지에는 고유한:

- title
- description
- canonical
- H1

이 존재해야 한다.

페이지 제목은 계산기의 실제 목적을 명확하게 설명한다.

계산기마다 서로 다른 description을 사용한다.

동일한 설명을 여러 페이지에서 반복하지 않는다.

계산기 설명에는 가능하면 다음 내용을 포함한다.

- 계산기의 목적
- 계산 방법
- 계산 공식
- 공식의 기준
- 주의사항
- 실제 사용 시 유의점

단순히 "계산해 보세요" 같은 짧은 설명만 제공하지 않는다.

---

## 29. 콘텐츠 품질

Google AdSense와 SEO를 고려해 계산기만 던져놓은 페이지를 만들지 않는다.

각 계산기는 가능한 경우 다음 정보를 제공한다.

```text
계산기
↓
사용 목적
↓
계산 방법
↓
계산 공식
↓
공식 기준
↓
주의사항
```

단, 의미 없는 문장을 반복하여 콘텐츠 길이만 늘리지 않는다.

사용자에게 실제 도움이 되는 정보를 제공한다.

---

## 30. 광고 규칙

Google AdSense를 사용한다.

공통 광고 컴포넌트가 있다면 이를 재사용한다.

광고 코드를 각 페이지마다 중복 작성하지 않는다.

AdSense script를 중복 삽입하지 않는다.

광고 때문에 초기 렌더링이 지연되지 않도록 한다.

광고 영역의 크기를 확보하여 CLS를 줄인다.

계산기 사용을 방해하는 위치에 광고를 과도하게 배치하지 않는다.

---

## 31. 이미지 규칙

이미지는 가능한 한 최적화한다.

가능하면:

- width
- height
- aspect-ratio
- lazy loading

등을 사용하여 layout shift를 방지한다.

첫 화면에 필요하지 않은 이미지는 lazy loading을 고려한다.

불필요한 이미지를 추가하지 않는다.

---

## 32. 외부 CDN 규칙

외부 CDN 요청을 최소화한다.

새로운 외부 CDN을 추가하기 전에 반드시 필요한지 검토한다.

외부 리소스는:

- 성능
- 개인정보
- CSP
- 안정성
- 장애 가능성
- 초기 렌더링 영향

을 고려한다.

---

## 33. 페이지 구조 규칙

계산기 페이지는 가능하면 다음 구조를 따른다.

```text
BaseLayout
 ├─ Header
 ├─ main
 │   ├─ breadcrumb
 │   ├─ category
 │   ├─ H1
 │   ├─ description
 │   └─ CalculatorPage
 │       └─ CalculatorShell
 │           ├─ calculator
 │           ├─ ad
 │           ├─ explanation
 │           ├─ formula
 │           ├─ basis
 │           └─ caution
 └─ Footer
```

페이지마다 구조가 불필요하게 달라지지 않도록 한다.

---

## 34. 계산기 카테고리

현재 사이트는 다음과 같은 카테고리를 사용할 수 있다.

- 금융
- 급여·노동
- 부동산
- 세금
- 생활 계산

새로운 계산기를 추가할 때 기존 분류 체계와 일관성을 유지한다.

---

## 35. 계산기 추가 규칙

새 계산기를 추가할 때 다음 순서로 작업한다.

1. 계산 공식 정의
2. 계산 로직을 TypeScript로 작성
3. 계산 로직 테스트 작성
4. 계산기 UI 컴포넌트 작성
5. 실시간 계산 가능 여부 검토
6. CalculatorPage에 연결
7. 설명/공식/기준/주의사항 작성
8. SEO metadata 작성
9. 반응형 UI 확인
10. 접근성 확인
11. `bun run check`
12. `bun test`
13. `bun run build`

계산 공식이 불명확한 경우 임의로 추정하지 않는다.

법률·세금·금융 계산기의 경우 적용 기준일과 조건을 명확하게 표시한다.

---

## 36. 테스트 규칙

계산 로직은 가능한 한 `bun test`로 검증한다.

특히 다음을 테스트한다.

- 정상적인 입력
- 0
- 최소값
- 최대값
- 경계값
- 소수
- 반올림
- 이자 계산
- 기간 계산
- 잘못된 입력
- 계산 결과의 주요 숫자

UI만 테스트하고 계산 로직 테스트를 생략하지 않는다.

---

## 37. 검증 명령

코드 변경 후 가능한 경우 다음 순서로 확인한다.

```bash
bun run check
bun test
bun run build
```

`package.json`에 이미 별도의 `check` script가 있다면 그것을 우선 사용한다.

예를 들어:

```bash
bun run check
```

가 다음을 수행한다면 그대로 사용한다.

```text
astro check
tsc --noEmit
```

오류가 발생하면 오류를 숨기거나 무시하지 말고 수정한다.

---

## 38. Git 규칙

GitHub 저장소는:

```text
babysteps0524/CozyMoneyCalculator
```

이다.

`main`은 production 기준 브랜치로 취급한다.

### 절대 규칙

Codex가 작업할 때 사용자의 명시적인 허락 없이 `main`에 직접 변경하지 않는다.

기능 개발, 리팩터링, 버그 수정은 별도 branch에서 수행한다.

예:

```text
feature/vat-calculator
fix/loan-input
refactor/calculator-architecture
perf/font-loading
seo/calculator-metadata
```

---

## 39. Git branch 규칙

작업 전에 현재 branch를 확인한다.

```bash
git status
git branch --show-current
```

현재 branch가 `main`이라면 큰 변경을 직접 수행하지 않는다.

필요한 경우 작업 목적에 맞는 branch를 생성한다.

예:

```bash
git switch -c refactor/calculator-architecture
```

기존 작업 branch가 있다면 그 branch를 재사용할 수 있다.

---

## 40. main 보호

다음 작업을 임의로 하지 않는다.

```bash
git push origin main
```

또는 main으로 직접 merge하는 작업.

사용자가 명시적으로 요청하지 않는 한:

- main 직접 수정
- main push
- production 배포 목적의 main 변경

을 하지 않는다.

---

## 41. Git diff 확인

코드 변경 후 반드시 변경 내용을 확인한다.

```bash
git status
git diff
```

변경 범위가 예상보다 크면 원인을 확인한다.

요청하지 않은 파일을 대량으로 변경하지 않는다.

---

## 42. Surgical Change 원칙

사용자가 요청하지 않은 코드를 임의로 대규모 변경하지 않는다.

특히 다음을 주의한다.

- 기존 계산 공식 변경
- 기존 UI 변경
- SEO metadata 변경
- 광고 구조 변경
- URL 구조 변경
- 파일 이동
- 패키지 교체
- dependency 업그레이드

이런 변경은 별도의 이유가 있어야 한다.

다만 현재 요청을 해결하기 위해 구조적 변경이 필요하다면 관련 범위 내에서 일관되게 수정한다.

---

## 43. 계산 공식 보존

기존 계산기가 이미 정상적으로 동작한다면 구조를 리팩터링하더라도 계산 결과를 변경하지 않는다.

리팩터링의 기본 원칙:

```text
기존 기능 유지
+
코드 구조 개선
+
유지보수성 개선
+
성능 개선
```

계산 결과가 달라지는 경우 반드시 그 이유를 확인한다.

---

## 44. 반올림 규칙

금융·세금 계산기는 반올림 방식이 결과에 영향을 줄 수 있다.

임의로 `Math.round()`를 추가하지 않는다.

기존 계산 로직의 반올림 규칙을 확인한다.

법령 또는 공식 계산 기준이 존재하는 경우 해당 기준을 우선한다.

---

## 45. 숫자 포맷 규칙

화면에 표시하는 숫자와 계산에 사용하는 숫자를 구분한다.

예:

```text
화면:
1,234,567원

계산:
1234567
```

숫자 포맷 함수가 프로젝트에 이미 존재하면 재사용한다.

동일한 숫자 포맷을 여러 파일에서 중복 구현하지 않는다.

---

## 46. URL 규칙

기존 calculator URL 구조를 유지한다.

새 페이지를 만들 때 임의로 URL을 변경하지 않는다.

기존 URL을 변경해야 한다면 SEO와 canonical, sitemap, 내부 링크 영향을 함께 검토한다.

---

## 47. Static SSG 규칙

이 사이트는 static SSG를 기본으로 한다.

가능하면 서버 런타임에 의존하지 않는다.

Astro 설정에서 static output을 유지한다.

사용자가 요청하지 않는 한 SSR이나 서버 adapter를 추가하지 않는다.

---

## 48. Cloudflare Pages

배포 대상은 Cloudflare Pages이다.

정적 사이트 배포를 기본으로 한다.

GitHub Actions를 임의로 추가하지 않는다.

Cloudflare Pages의 GitHub 연동을 기본 배포 방식으로 생각한다.

---

## 49. GitHub Actions

새로운 GitHub Actions workflow를 임의로 생성하지 않는다.

특히 다음 파일을 사용자가 요청하지 않았는데 추가하지 않는다.

```text
.github/workflows/*.yml
.github/workflows/*.yaml
```

CI가 필요하다고 판단하더라도 먼저 기존 GitHub/Cloudflare Pages 구조를 확인한다.

---

## 50. 파일 생성 원칙

새 파일은 실제 필요할 때만 생성한다.

비슷한 기능의 파일이 이미 존재한다면 기존 파일을 확장하거나 재사용한다.

다음과 같은 중복 파일을 만들지 않는다.

```text
utils.ts
helpers.ts
common.ts
common2.ts
calculatorHelper.ts
```

각 파일의 책임을 명확하게 한다.

---

## 51. 공통 유틸리티 규칙

두 개 이상의 계산기에서 동일한 로직이 반복된다면 공통 utility로 추출하는 것을 검토한다.

예:

```text
number-input.ts
runtime.ts
format.ts
```

하지만 한 곳에서만 사용되는 간단한 함수까지 무조건 추상화하지 않는다.

---

## 52. 주석 규칙

주석은 코드가 왜 그렇게 동작하는지 설명할 때만 작성한다.

다음과 같은 의미 없는 주석은 작성하지 않는다.

```ts
// 계산한다
calculate();
```

```ts
// 입력값
const amount = ...
```

코드만으로 이해하기 어려운 법률·세금·금융 계산 기준은 근거와 함께 설명할 수 있다.

---

## 53. 오류 처리

오류를 숨기지 않는다.

다음 방식으로 오류를 무시하지 않는다.

```ts
try {
  ...
} catch {
}
```

또는:

```ts
// @ts-ignore
```

문제가 발생한 원인을 해결한다.

---

## 54. 의존성 추가

새 npm package를 추가하기 전에 기존 프로젝트 코드로 해결할 수 있는지 먼저 검토한다.

특히 다음 목적의 작은 라이브러리는 무조건 추가하지 않는다.

- 숫자 포맷
- 간단한 DOM 처리
- 간단한 날짜 계산
- 간단한 배열 처리
- 간단한 문자열 처리

의존성을 추가한다면:

- 왜 필요한지
- 번들 크기
- 브라우저 JavaScript 증가 여부
- 유지보수성

을 고려한다.

---

## 55. 성능 우선순위

성능을 개선할 때 다음을 우선한다.

1. 불필요한 JavaScript 제거
2. 초기 렌더링 개선
3. 폰트 최적화
4. 이미지 최적화
5. 외부 요청 최소화
6. CLS 개선
7. 계산기 이벤트 최적화
8. 불필요한 DOM 생성 제거
9. 캐싱 활용

단순히 Lighthouse 점수만 올리는 변경을 하지 않는다.

실제 사용자 경험을 우선한다.

---

## 56. Lighthouse / Core Web Vitals

다음 항목을 중요하게 취급한다.

- LCP
- FCP
- CLS
- INP
- TBT

특히 CLS를 주의한다.

광고, 폰트, 동적 계산 결과, 이미지, toast 등으로 레이아웃이 이동하지 않도록 한다.

---

## 57. 접근성 + 성능 + SEO 우선순위

기능 구현 시 우선순위:

```text
정확한 계산
>
기능 안정성
>
접근성
>
성능
>
SEO
>
시각적 장식
```

단순한 애니메이션이나 장식 때문에 성능을 희생하지 않는다.

페이지 전환 애니메이션을 임의로 추가하지 않는다.

---

## 58. 기존 기능 보존

리팩터링 시 다음 기능을 임의로 제거하지 않는다.

- 계산 기능
- 초기화
- 복사
- +/- 버튼
- 실시간 계산
- 설명 영역
- 공식 설명
- 주의사항
- 광고
- SEO metadata
- breadcrumb
- dark mode
- responsive layout

기존 기능을 제거해야 할 경우 반드시 사용자의 요청이 있어야 한다.

---

## 59. 계산기 UI 일관성

모든 계산기는 가능한 한 동일한 UX 패턴을 사용한다.

예:

```text
입력
↓
계산 결과
↓
복사 / 초기화
↓
광고
↓
계산 방법
↓
계산 공식
↓
공식 기준
↓
주의사항
```

계산기마다 버튼 스타일이나 입력 스타일을 임의로 다르게 만들지 않는다.

---

## 60. 결과 업데이트 UX

실시간 계산을 지원하는 계산기는 사용자가 입력할 때 결과가 자연스럽게 업데이트되어야 한다.

단, 결과 영역이 업데이트될 때:

- 입력 포커스를 잃지 않는다.
- 커서가 이동하지 않는다.
- 페이지가 점프하지 않는다.
- DOM 전체를 다시 만들지 않는다.
- 불필요한 애니메이션을 실행하지 않는다.

---

## 61. 변경 전 분석

큰 변경을 하기 전에 먼저 기존 구조를 확인한다.

특히 리팩터링 작업에서는:

```text
현재 파일 구조
현재 import 관계
현재 계산 로직
현재 페이지 구조
현재 공통 컴포넌트
현재 테스트
현재 build/check script
```

를 확인한다.

기존 코드를 충분히 확인하지 않고 새로운 구조를 임의로 만들지 않는다.

---

## 62. 대규모 리팩터링

대규모 리팩터링에서는 다음 순서를 따른다.

```text
1. 현재 구조 분석
2. 중복/문제점 확인
3. 목표 구조 정의
4. 작은 단위로 변경
5. 계산 결과 보존 확인
6. TypeScript 검사
7. 테스트
8. build
9. diff 검토
```

한 번에 모든 파일을 정규식으로 대량 변경하는 방식은 피한다.

자동 변경을 사용하더라도 결과를 반드시 확인한다.

---

## 63. Codex 작업 원칙

Codex는 코드를 작성하기 전에 현재 repository 상태를 확인한다.

최소한 다음을 확인한다.

```bash
git status
git branch --show-current
```

관련 파일을 먼저 읽는다.

사용자의 요청과 관계없는 파일은 수정하지 않는다.

기존 코드 스타일과 프로젝트 구조를 우선한다.

추측으로 API나 계산 공식을 만들지 않는다.

---

## 64. Codex 응답 원칙

작업을 수행할 때 다음 정보를 명확하게 보고한다.

```text
변경한 내용
검증 결과
발생한 오류
추가로 필요한 작업
```

검증하지 않은 것을 "정상 동작한다"고 말하지 않는다.

`bun run check`, `bun test`, `bun run build`를 실제로 실행하지 않았다면 실행했다고 말하지 않는다.

---

## 65. Git commit 규칙

커밋 메시지는 변경 목적을 명확히 표현한다.

예:

```text
feat: add VAT calculator
fix: update loan live calculation
refactor: split calculator runtime
perf: optimize font loading
seo: improve calculator metadata
test: add property tax calculation cases
```

서로 관계없는 변경을 하나의 커밋에 무작정 섞지 않는다.

---

## 66. 절대 하지 말아야 할 것

다음 행동은 사용자 요청 없이 하지 않는다.

- main 직접 수정
- main push
- GitHub Actions 추가
- React/Vue/Svelte 추가
- 일반 Javascript 추가
- 일반 CSS 추가
- 대규모 npm dependency 추가
- SSR 전환
- Astro adapter 추가
- URL 구조 변경
- 계산 공식 임의 변경
- 광고 제거
- SEO metadata 제거
- 기존 계산기 기능 제거
- dark mode 제거
- 기존 UI 패턴을 이유 없이 변경
- 대량 파일 자동 치환
- `any`로 타입 오류 숨기기
- `@ts-ignore` 사용
- 빈 catch로 오류 숨기기

---

## 67. 최종 목표

이 프로젝트의 코드는 다음 특성을 가져야 한다.

```text
Astro
+
TypeScript
+
Bun
+
UnoCSS Attributify
+
Static SSG
+
계산기별 독립 컴포넌트
+
공통 계산 runtime
+
공통 페이지 구조
+
정확한 계산
+
실시간 계산
+
반응형 UI
+
접근성
+
SEO
+
AdSense 친화적 구조
+
낮은 JavaScript
+
낮은 CLS
+
Cloudflare Pages 배포
```

새로운 코드를 작성할 때는 "작동하는 코드"뿐 아니라 "현재 CozyMoneyCalculator 구조와 일관되는 코드"를 목표로 한다.
