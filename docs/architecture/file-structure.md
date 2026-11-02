# v5 File Tree

This document shows the current repository layout on the `v5` branch. It excludes `.git`, `node_modules`, `dist`, `.astro`, and `.wrangler`, which are generated or externally managed.

- `src/pages`: Astro routes; existing URLs are preserved.
- `src/features`: calculator and tool UI, logic, and content grouped by feature.
- `src/components`: shared page frames and UI.
- `src/lib`: shared runtime, input, formatting, and SEO logic.
- `tests`: calculator, tool, and shared behavior tests.

```text
CozyMoneyCalculator/                         # 프로젝트 루트
├── .vscode/                                 # VS Code 설정
│   ├── extensions.json                      # 권장 확장 프로그램 설정
│   ├── launch.json                          # 디버깅 실행 설정
│   └── settings.json                        # 편집기 설정
│
├── docs/                                    # 프로젝트 문서
│   └── architecture/                        # 아키텍처 문서
│       └── file-structure.md                # 파일 구조 설명
│
├── public/                                  # 정적 파일
│   ├── ads.txt                              # AdSense 광고 게시자 정보
│   └── favicon.svg                          # 브라우저 파비콘
│
├── src/                                     # 애플리케이션 소스 코드
│   ├── components/                          # 재사용 UI 컴포넌트
│   │   ├── calculator/                      # 계산기 공통 UI
│   │   │   ├── CalculatorBreadcrumb.astro   # 페이지 위치 경로 표시
│   │   │   ├── CalculatorContent.astro      # 직접 콘텐츠를 작성하는 파일 X, 계산기 상세 정보 컴포넌트와 광고 영역 연결하는 역할
│   │   │   ├── CalculatorDetails.astro      # 전달받은 콘텐츠를 이용해 계산기 설명,계산 방법,공식,예시 등 상세 섹션을 렌더링
│   │   │   ├── CalculatorLayout.astro       # 브레드크럼,제목,계산기 영역,주의사항,안내 콘텐츠 배치하는 계산기 본문 레이아웃
│   │   │   ├── CalculatorPage.astro         # BaseLayout,Header,Footer,CalculatorLayout 연결&계산기 페이지 최상위 조립담당
│   │   │   ├── CalculatorPageHeading.astro  # 계산기 제목과 부가 설명 표시
│   │   │   ├── CalculatorResultCopy.astro   # 계산 결과 복사 UI
│   │   │   ├── CalculatorShell.astro        # 입력 영역과 결과 영역의 공통 틀
│   │   │   └── CalculatorUsageNotice.astro  # 이용 전 주의사항 표시
│   │   │
│   │   ├── shared/                          # 사이트 공통 UI
│   │   │   ├── AdSlot.astro                 # 광고 영역 구성
│   │   │   ├── Footer.astro                 # 사이트 하단 영역 구성
│   │   │   └── Header.astro                 # 사이트 상단 로고와 메뉴 구성
│   │   │
│   │   └── tool/                            # 생활도구 공통 UI
│   │       ├── ToolInfo.astro               # 생활도구 설명 정보 표시
│   │       ├── ToolPanel.astro              # 도구의 kind 값에 따라 로또, 날짜, 나이, 단위 변환 등 개별 도구 UI를 선택해 출력
│   │       └── ToolShell.astro              # 도구 UI와 설명, 광고를 배치하고 공통 런타임을 통해 해당 도구의 동작을 초기화
│   │
│   ├── content/                             # 콘텐츠 관리 영역
│   │   ├── calculators/                     # 계산기 관련 콘텐츠
│   │   └── guides/                          # 가이드 콘텐츠
│   │
│   ├── data/                                # 사이트 데이터
│   │   └── site.ts                          # 사이트 공통 설정 데이터
│   │
│   ├── features/                            # 계산기·생활도구별 기능
│   │   ├── calculators/                     # 개별 계산기 기능 모음
│   │   │   ├── acquisition/                 # 취득세 계산기
│   │   │   │   ├── acquisition.ts           # 취득세 계산 로직
│   │   │   │   ├── AcquisitionCalculator.astro # 취득세 계산기 UI
│   │   │   │   ├── content.ts               # 취득세 설명 콘텐츠
│   │   │   │   └── index.ts                 # 취득세 모듈 진입점
│   │   │   │
│   │   │   ├── brokerage/                   # 중개보수 계산기
│   │   │   │   ├── brokerage.ts             # 중개보수 계산 로직
│   │   │   │   ├── BrokerageCalculator.astro # 중개보수 계산기 UI
│   │   │   │   ├── content.ts               # 중개보수 설명 콘텐츠
│   │   │   │   └── index.ts                 # 중개보수 모듈 진입점
│   │   │   │
│   │   │   ├── capital-gain/                # 양도소득세 계산기
│   │   │   │   ├── capital-gain.ts          # 양도소득세 계산 로직
│   │   │   │   ├── CapitalGainCalculator.astro # 양도소득세 계산기 UI
│   │   │   │   ├── content.ts               # 양도소득세 설명 콘텐츠
│   │   │   │   └── index.ts                 # 모듈 진입점
│   │   │   │
│   │   │   ├── car-tax/                     # 자동차세 계산기
│   │   │   │   ├── car-tax.ts               # 자동차세 계산 로직
│   │   │   │   ├── CarTaxCalculator.astro   # 자동차세 계산기 UI
│   │   │   │   ├── content.ts               # 자동차세 설명 콘텐츠
│   │   │   │   └── index.ts                 # 모듈 진입점
│   │   │   │
│   │   │   ├── compound/                    # 복리 계산기
│   │   │   │   ├── compound.ts              # 복리 계산 로직
│   │   │   │   ├── CompoundCalculator.astro # 복리 계산기 UI
│   │   │   │   ├── content.ts               # 복리 설명 콘텐츠
│   │   │   │   └── index.ts                 # 모듈 진입점
│   │   │   │
│   │   │   ├── dsr/                         # DSR 계산기
│   │   │   │   ├── content.ts               # DSR 설명 콘텐츠
│   │   │   │   ├── dsr.ts                   # DSR 계산 로직
│   │   │   │   ├── DsrCalculator.astro      # DSR 계산기 UI
│   │   │   │   └── index.ts                 # 모듈 진입점
│   │   │   │
│   │   │   ├── dti/                         # DTI 계산기
│   │   │   │   ├── content.ts               # DTI 설명 콘텐츠
│   │   │   │   ├── dti.ts                   # DTI 계산 로직
│   │   │   │   ├── DtiCalculator.astro      # DTI 계산기 UI
│   │   │   │   └── index.ts                 # 모듈 진입점
│   │   │   │
│   │   │   ├── hourly-wage/                 # 시급 계산기
│   │   │   │   ├── content.ts               # 시급 계산기 설명 콘텐츠
│   │   │   │   ├── hourly-wage.ts           # 시급 계산 로직
│   │   │   │   ├── HourlyWageCalculator.astro # 시급 계산기 UI
│   │   │   │   └── index.ts                 # 모듈 진입점
│   │   │   │
│   │   │   ├── income-tax/                  # 소득세 계산기
│   │   │   │   ├── content.ts               # 소득세 설명 콘텐츠
│   │   │   │   ├── income-tax.ts            # 소득세 계산 로직
│   │   │   │   ├── IncomeTaxCalculator.astro # 소득세 계산기 UI
│   │   │   │   └── index.ts                 # 모듈 진입점
│   │   │   │
│   │   │   ├── lease-loan/                  # 전세자금대출 계산기
│   │   │   │   ├── content.ts               # 전세자금대출 설명 콘텐츠
│   │   │   │   ├── index.ts                 # 모듈 진입점
│   │   │   │   ├── lease-loan.ts            # 전세자금대출 계산 로직
│   │   │   │   └── LeaseLoanCalculator.astro # 전세자금대출 계산기 UI
│   │   │   │
│   │   │   ├── legal-scrivener/             # 법무사 비용 계산기
│   │   │   │   ├── content.ts               # 법무사 비용 설명 콘텐츠
│   │   │   │   ├── index.ts                 # 모듈 진입점
│   │   │   │   ├── legal-scrivener.ts       # 법무사 비용 계산 로직
│   │   │   │   └── LegalScrivenerCalculator.astro # 법무사 비용 계산기 UI
│   │   │   │
│   │   │   ├── loan/                        # 대출 계산기
│   │   │   │   ├── content.ts               # 대출 계산 설명 콘텐츠
│   │   │   │   ├── index.ts                 # 모듈 진입점
│   │   │   │   ├── loan.ts                  # 대출 상환 계산 로직
│   │   │   │   └── LoanCalculator.astro     # 대출 계산기 UI
│   │   │   │
│   │   │   ├── monthly-salary/              # 월급 계산기
│   │   │   │   ├── content.ts               # 월급 계산 설명 콘텐츠
│   │   │   │   ├── index.ts                 # 모듈 진입점
│   │   │   │   ├── monthly-salary.ts        # 월급 계산 로직
│   │   │   │   └── MonthlySalaryCalculator.astro # 월급 계산기 UI
│   │   │   │
│   │   │   ├── percentage/                  # 퍼센트 계산기
│   │   │   │   ├── content.ts               # 퍼센트 계산 설명 콘텐츠
│   │   │   │   ├── index.ts                 # 모듈 진입점
│   │   │   │   ├── percentage.ts            # 퍼센트 계산 로직
│   │   │   │   └── PercentageCalculator.astro # 퍼센트 계산기 UI
│   │   │   │
│   │   │   ├── property/                    # 재산세 계산기
│   │   │   │   ├── content.ts               # 재산세 설명 콘텐츠
│   │   │   │   ├── index.ts                 # 모듈 진입점
│   │   │   │   ├── property.ts              # 재산세 계산 로직
│   │   │   │   └── PropertyTaxCalculator.astro # 재산세 계산기 UI
│   │   │   │
│   │   │   ├── rent/                        # 월세 계산기
│   │   │   │   ├── content.ts               # 월세 계산 설명 콘텐츠
│   │   │   │   ├── index.ts                 # 모듈 진입점
│   │   │   │   ├── rent.ts                  # 월세 계산 로직
│   │   │   │   └── RentCalculator.astro     # 월세 계산기 UI
│   │   │   │
│   │   │   ├── salary/                      # 연봉 계산기
│   │   │   │   ├── content.ts               # 연봉 계산 설명 콘텐츠
│   │   │   │   ├── index.ts                 # 모듈 진입점
│   │   │   │   ├── salary.ts                # 연봉 계산 로직
│   │   │   │   └── SalaryCalculator.astro   # 연봉 계산기 UI
│   │   │   │
│   │   │   ├── savings/                     # 예적금 계산기
│   │   │   │   ├── content.ts               # 예적금 설명 콘텐츠
│   │   │   │   ├── index.ts                 # 모듈 진입점
│   │   │   │   ├── savings.ts               # 예적금 계산 로직
│   │   │   │   └── SavingsCalculator.astro  # 예적금 계산기 UI
│   │   │   │
│   │   │   ├── severance/                   # 퇴직금 계산기
│   │   │   │   ├── content.ts               # 퇴직금 설명 콘텐츠
│   │   │   │   ├── index.ts                 # 모듈 진입점
│   │   │   │   ├── severance.ts             # 퇴직금 계산 로직
│   │   │   │   └── SeveranceCalculator.astro # 퇴직금 계산기 UI
│   │   │   │
│   │   │   ├── unemployment/                # 실업급여 계산기
│   │   │   │   ├── content.ts               # 실업급여 설명 콘텐츠
│   │   │   │   ├── index.ts                 # 모듈 진입점
│   │   │   │   ├── unemployment.ts          # 실업급여 계산 로직
│   │   │   │   └── UnemploymentCalculator.astro # 실업급여 계산기 UI
│   │   │   │
│   │   │   ├── vacation/                    # 연차 계산기
│   │   │   │   ├── content.ts               # 연차 설명 콘텐츠
│   │   │   │   ├── index.ts                 # 모듈 진입점
│   │   │   │   ├── vacation.ts              # 연차 계산 로직
│   │   │   │   └── VacationCalculator.astro # 연차 계산기 UI
│   │   │   │
│   │   │   ├── vat/                         # 부가가치세 계산기
│   │   │   │   ├── content.ts               # 부가가치세 설명 콘텐츠
│   │   │   │   ├── index.ts                 # 모듈 진입점
│   │   │   │   ├── vat.ts                   # 부가가치세 계산 로직
│   │   │   │   └── VatCalculator.astro      # 부가가치세 계산기 UI
│   │   │   │
│   │   │   ├── weekly/                      # 주휴수당 계산기
│   │   │   │   ├── content.ts               # 주휴수당 설명 콘텐츠
│   │   │   │   ├── index.ts                 # 모듈 진입점
│   │   │   │   ├── weekly.ts                # 주휴수당 계산 로직
│   │   │   │   └── WeeklyCalculator.astro   # 주휴수당 계산기 UI
│   │   │   │
│   │   │   ├── catalog.ts                   # 개별 계산기의 content.ts에서 정의를 가져와 계산기 식별자와 정의를 연결하는 등록부
│   │   │   └── types.ts                     # 계산기 공통 타입 정의
│   │   │
│   │   └── tools/                            # 개별 생활도구 기능 모음
│   │       ├── age/                          # 나이 계산 도구
│   │       │   ├── age.ts                    # 나이 계산 로직
│   │       │   ├── AgeTool.astro             # 나이 계산 UI
│   │       │   ├── index.ts                  # 모듈 진입점
│   │       │   └── mount.ts                  # 도구 초기화·연결 처리
│   │       │
│   │       ├── date/                         # 날짜 계산 도구
│   │       │   ├── date.ts                   # 날짜 계산 로직
│   │       │   ├── DateTool.astro            # 날짜 계산 UI
│   │       │   ├── index.ts                  # 모듈 진입점
│   │       │   └── mount.ts                  # 도구 초기화·연결 처리
│   │       │
│   │       ├── dday/                         # 디데이 계산 도구
│   │       │   ├── dday.ts                   # 디데이 계산 로직
│   │       │   ├── DdayTool.astro            # 디데이 계산 UI
│   │       │   ├── index.ts                  # 모듈 진입점
│   │       │   └── mount.ts                  # 도구 초기화·연결 처리
│   │       │
│   │       ├── lotto/                        # 로또 번호 생성 도구
│   │       │   ├── index.ts                  # 모듈 진입점
│   │       │   ├── lotto.ts                  # 번호 생성 로직
│   │       │   ├── LottoTool.astro            # 로또 도구 UI
│   │       │   └── mount.ts                  # 도구 초기화·연결 처리
│   │       │
│   │       ├── password/                     # 비밀번호 생성 도구
│   │       │   ├── index.ts                  # 모듈 진입점
│   │       │   ├── mount.ts                  # 도구 초기화·연결 처리
│   │       │   ├── password.ts               # 비밀번호 생성 로직
│   │       │   └── PasswordTool.astro        # 비밀번호 도구 UI
│   │       │
│   │       ├── percent/                      # 퍼센트 계산 도구
│   │       │   ├── index.ts                  # 모듈 진입점
│   │       │   ├── mount.ts                  # 도구 초기화·연결 처리
│   │       │   ├── percent.ts                # 퍼센트 계산 로직
│   │       │   └── PercentTool.astro         # 퍼센트 도구 UI
│   │       │
│   │       ├── picker/                       # 선택·뽑기 도구
│   │       │   ├── index.ts                  # 모듈 진입점
│   │       │   ├── mount.ts                  # 도구 초기화·연결 처리
│   │       │   ├── picker.ts                 # 선택·뽑기 처리 로직
│   │       │   └── PickerTool.astro           # 선택·뽑기 UI
│   │       │
│   │       ├── random/                       # 난수 생성 도구
│   │       │   ├── index.ts                  # 모듈 진입점
│   │       │   ├── mount.ts                  # 도구 초기화·연결 처리
│   │       │   ├── random.ts                 # 난수 생성 로직
│   │       │   └── RandomNumberTool.astro     # 난수 생성 UI
│   │       │
│   │       ├── unit/                         # 단위 변환 도구
│   │       │   ├── index.ts                  # 모듈 진입점
│   │       │   ├── mount.ts                  # 도구 초기화·연결 처리
│   │       │   ├── unit.ts                   # 단위 변환 로직
│   │       │   └── UnitConverterTool.astro    # 단위 변환 UI
│   │       │
│   │       └── catalog.ts          # 도구별 종류,제목,설명,URL을 정의하는 목록, ToolPanel과 런타임이 사용할 도구 식별 정보 제공
│   │
│   ├── layouts/                              # 페이지 공통 레이아웃
│   │   └── BaseLayout.astro                 # HTML 기본 구조, 메타데이터, 공통 스크립트 구성
│   │
│   ├── lib/                                  # 여러 기능에서 재사용하는 유틸리티
│   │   ├── calculator/                       # 계산기 공통 처리 로직
│   │   │   ├── copy-result.ts                # 계산 결과 복사 처리
│   │   │   ├── dom.ts                        # DOM 요소 관련 공통 처리
│   │   │   ├── format.ts                     # 계산기 값 표시 형식 처리
│   │   │   ├── number-input.ts               # 숫자 입력 처리
│   │   │   └── runtime.ts            # 숫자 입력 컨트롤과 입력·변경 이벤트를 공통 처리하고, 중복 바인딩 방지 및 정리 작업까지 담당
│   │   │
│   │   ├── format/                           # 공통 데이터 형식 처리
│   │   ├── seo/                              # 검색엔진 최적화 관련 기능
│   │   │   └── metadata.ts                   # SEO 메타데이터 구성
│   │   │
│   │   └── tool/                             # 생활도구 공통 처리 로직
│   │       ├── helpers.ts                    # 생활도구 보조 함수
│   │       ├── runtime.ts               # 도구 종류별 mount.ts를 동적으로 불러오는 실행 연결부. 선택한 도구의 초기화 코드를 연결
│   │       └── types.ts                      # 생활도구 공통 타입 정의
│   │
│   ├── pages/                                # URL에 대응하는 페이지
│   │   ├── about/                            # 사이트 소개 페이지
│   │   │   └── index.astro                   # 소개 페이지 출력
│   │   │
│   │   ├── calculators/                      # 계산기 페이지 경로
│   │   │   ├── acquisition/index.astro       # 취득세 계산기 페이지
│   │   │   ├── brokerage/index.astro         # 중개보수 계산기 페이지
│   │   │   ├── capitalGain/index.astro       # 양도소득세 계산기 페이지
│   │   │   ├── carTax/index.astro            # 자동차세 계산기 페이지
│   │   │   ├── compound/index.astro          # 복리 계산기 페이지
│   │   │   ├── dsr/index.astro               # DSR 계산기 페이지
│   │   │   ├── dti/index.astro               # DTI 계산기 페이지
│   │   │   ├── hourly-wage/index.astro       # 시급 계산기 페이지
│   │   │   ├── incomeTax/index.astro         # 소득세 계산기 페이지
│   │   │   ├── leaseLoan/index.astro         # 전세자금대출 계산기 페이지
│   │   │   ├── legal-scrivener/index.astro   # 법무사 비용 계산기 페이지
│   │   │   ├── loan/index.astro              # 대출 계산기 페이지
│   │   │   ├── monthly-salary/index.astro    # 월급 계산기 페이지
│   │   │   ├── percentage/index.astro        # 퍼센트 계산기 페이지
│   │   │   ├── property/index.astro          # 재산세 계산기 페이지
│   │   │   ├── rent/index.astro              # 월세 계산기 페이지
│   │   │   ├── salary/index.astro            # 연봉 계산기 페이지
│   │   │   ├── savings/index.astro           # 예적금 계산기 페이지
│   │   │   ├── severance/index.astro         # 퇴직금 계산기 페이지
│   │   │   ├── unemployment/index.astro      # 실업급여 계산기 페이지
│   │   │   ├── vacation/index.astro          # 연차 계산기 페이지
│   │   │   ├── vat/index.astro               # 부가가치세 계산기 페이지
│   │   │   ├── weekly/index.astro             # 주휴수당 계산기 페이지
│   │   │   └── index.astro                   # 전체 계산기 목록 페이지
│   │   │
│   │   ├── contact/                          # 문의 페이지
│   │   │   └── index.astro                   # 문의 페이지 출력
│   │   ├── guides/                           # 가이드 페이지 경로
│   │   ├── privacy/                          # 개인정보처리방침 페이지
│   │   │   └── index.astro                   # 개인정보처리방침 출력
│   │   ├── terms/                            # 이용약관 페이지
│   │   │   └── index.astro                   # 이용약관 출력
│   │   │
│   │   ├── tools/                            # 생활도구 페이지 경로
│   │   │   ├── age/index.astro               # 나이 계산 도구 페이지
│   │   │   ├── date/index.astro              # 날짜 계산 도구 페이지
│   │   │   ├── dday/index.astro              # 디데이 도구 페이지
│   │   │   ├── lotto/index.astro             # 로또 번호 생성 페이지
│   │   │   ├── password/index.astro          # 비밀번호 생성 페이지
│   │   │   ├── percent/index.astro            # 퍼센트 도구 페이지
│   │   │   ├── picker/index.astro            # 선택·뽑기 도구 페이지
│   │   │   ├── random/index.astro            # 난수 생성 페이지
│   │   │   ├── unit/index.astro              # 단위 변환 페이지
│   │   │   └── index.astro                   # 전체 생활도구 목록 페이지
│   │   │
│   │   ├── 404.astro                         # 페이지를 찾을 수 없을 때 표시
│   │   ├── index.astro                       # 홈페이지
│   │   └── robots.txt.ts                     # 검색엔진 크롤링 규칙 제공
│   │
│   ├── scripts/                              # 공통 스크립트 영역
│   └── env.d.ts                              # 환경 변수와 Astro 타입 선언
│
├── tests/                                    # 자동화 테스트
│   ├── calculators/                          # 계산기 기능 테스트
│   │   ├── acquisition.test.ts               # 취득세 계산 테스트
│   │   ├── brokerage.test.ts                 # 중개보수 계산 테스트
│   │   ├── calculators.test.ts               # 공통 계산기 테스트
│   │   ├── capital-gain.test.ts              # 양도소득세 계산 테스트
│   │   ├── car-tax.test.ts                   # 자동차세 계산 테스트
│   │   ├── compound.test.ts                  # 복리 계산 테스트
│   │   ├── dsr.test.ts                       # DSR 계산 테스트
│   │   ├── dti.test.ts                       # DTI 계산 테스트
│   │   ├── hourly-wage.test.ts               # 시급 계산 테스트
│   │   ├── income-tax.test.ts                # 소득세 계산 테스트
│   │   ├── lease-loan.test.ts                # 전세자금대출 계산 테스트
│   │   ├── legal-scrivener.test.ts           # 법무사 비용 계산 테스트
│   │   ├── loan.test.ts                      # 대출 계산 테스트
│   │   ├── monthly-salary.test.ts            # 월급 계산 테스트
│   │   ├── percentage.test.ts                # 퍼센트 계산 테스트
│   │   ├── property.test.ts                  # 재산세 계산 테스트
│   │   ├── rent.test.ts                      # 월세 계산 테스트
│   │   ├── salary.test.ts                    # 연봉 계산 테스트
│   │   ├── savings.test.ts                   # 예적금 계산 테스트
│   │   ├── severance.test.ts                 # 퇴직금 계산 테스트
│   │   ├── unemployment.test.ts              # 실업급여 계산 테스트
│   │   ├── vacation.test.ts                  # 연차 계산 테스트
│   │   ├── vat.test.ts                       # 부가가치세 계산 테스트
│   │   └── weekly.test.ts                    # 주휴수당 계산 테스트
│   │
│   ├── shared/                               # 공통 기능 테스트
│   │   ├── calculator-roots.test.ts          # 계산기 초기화 관련 테스트
│   │   └── number-input.test.ts              # 숫자 입력 처리 테스트
│   │
│   └── tools/                                # 생활도구 기능 테스트
│       ├── age.test.ts                       # 나이 계산 테스트
│       ├── date.test.ts                      # 날짜 계산 테스트
│       ├── dday.test.ts                      # 디데이 계산 테스트
│       ├── lotto.test.ts                     # 로또 번호 생성 테스트
│       ├── password.test.ts                  # 비밀번호 생성 테스트
│       ├── percent.test.ts                   # 퍼센트 계산 테스트
│       ├── picker.test.ts                    # 선택·뽑기 테스트
│       ├── random.test.ts                    # 난수 생성 테스트
│       └── unit.test.ts                      # 단위 변환 테스트
│
├── .codexignore                              # Codex 작업 대상 제외 규칙
├── .env                                      # 로컬 환경 변수
├── .env.example                              # 환경 변수 설정 예시
├── .gitignore                                # Git 추적 제외 규칙
├── .prettierignore                           # 포맷팅 제외 규칙
├── .prettierrc                               # 코드 포맷팅 규칙
├── AGENTS.md                                 # AI 코딩 에이전트 작업 지침
├── astro.config.ts                           # Astro 프로젝트 설정
├── bun.lock                                  # Bun 의존성 잠금 파일
├── package.json                              # 프로젝트 정보, 의존성, 실행 명령어
├── README.md                                 # 프로젝트 소개와 사용 안내
├── tsconfig.json                             # TypeScript 컴파일 설정
└── uno.config.ts                             # UnoCSS 스타일 설정
```
