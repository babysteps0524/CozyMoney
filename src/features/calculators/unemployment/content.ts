import type { CalculatorDefinition } from '../types';
import type { CalculatorDetailsContent } from '../types';

export const guidance: CalculatorDetailsContent = {
  intro:
    '이직일, 연령, 직전 3개월 임금총액, 1일 소정근로시간과 고용보험 가입기간을 바탕으로 구직급여의 예상 1일 지급액과 소정급여일수를 참고용으로 계산합니다.',
  steps: [
    '생년월일과 이직일을 입력해 이직일 기준 만 나이 구분을 확인합니다.',
    '직전 3개월 임금총액과 이직일을 이용해 1일 평균임금을 추정합니다.',
    '평균임금의 60%를 기준으로 이직일과 근로시간에 따른 상·하한을 적용합니다.',
    '연령·장애인 여부와 고용보험 가입기간을 기준으로 소정급여일수를 적용합니다.',
  ],
  formula:
    '기본 구직급여 1일액 = 1일 평균임금 × 60%. 최종 1일액은 이직일과 1일 소정근로시간 등에 따른 법정 상·하한을 반영합니다.',
  basis:
    '구직급여는 고용보험법과 관련 시행령·시행규칙에 따라 결정됩니다. 실제 신청과 수급자격 확인은 고용보험 및 고용24의 최신 안내와 관할 고용센터 기준을 우선 확인해야 합니다.',
  cautions: [
    '이 계산기는 구직급여 금액을 모의 계산할 뿐 수급자격을 판정하지 않습니다.',
    '피보험 단위기간, 이직사유, 근로 의사·능력과 재취업활동 등 실제 수급요건을 별도로 확인해야 합니다.',
    '피보험 단위기간 180일은 단순 재직기간 6개월과 같은 의미가 아닙니다.',
    '상한액·하한액은 이직일과 1일 소정근로시간 등에 따라 달라질 수 있습니다.',
    '반복수급, 연장급여, 조기재취업수당 등은 이 계산기에 포함하지 않습니다.',
  ],
  examples: [
    {
      title: '2026년 10월 6일 이직, 직전 3개월 임금 900만원',
      inputs:
        '생년월일 1975년 10월 7일, 1일 소정근로시간 8시간, 고용보험 가입기간 1년 이상 3년 미만을 가정합니다.',
      result:
        '이직일 기준 만 나이를 계산한 뒤 1일 평균임금을 추정하고, 평균임금의 60%와 2026년 상·하한액을 비교해 1일 지급액을 계산합니다. 소정급여일수는 해당 가입기간과 연령 구분에 따라 적용합니다.',
    },
  ],
  faqs: [
    {
      question: '생년월일을 입력하면 나이가 자동으로 계산되나요?',
      answer:
        '네. 생년월일과 이직일을 기준으로 만 나이를 계산해 50세 미만 또는 50세 이상 구분을 적용합니다.',
    },
    {
      question: '장애인인 경우에는 어떻게 적용되나요?',
      answer:
        '장애인 여부를 별도로 선택하면 연령과 관계없이 50세 이상·장애인 구분의 소정급여일수를 적용하도록 계산합니다.',
    },
    {
      question: '3개월 임금총액은 어떻게 입력하나요?',
      answer:
        '월급 한 달치가 아니라 이직일 직전 3개월 동안의 임금총액을 입력합니다. 실제 평균임금 산정에서는 제외기간·제외임금 등이 반영될 수 있습니다.',
    },
    {
      question: '6개월 일하면 실업급여를 받을 수 있나요?',
      answer:
        '단순 재직기간만으로 판단할 수 없습니다. 피보험 단위기간 180일 이상 등 별도의 수급요건을 확인해야 합니다.',
    },
    {
      question: '계산 결과가 실제 지급액과 다른 이유는 무엇인가요?',
      answer:
        '수급자격 인정 여부, 이직일, 실제 평균임금, 피보험기간, 소정근로시간 및 법령상 상·하한 적용에 따라 실제 지급액이 달라질 수 있습니다.',
    },
  ],
  sources: [
    {
      title: '고용보험',
      href: 'https://www.ei.go.kr/',
    },
    {
      title: '고용24',
      href: 'https://www.work24.go.kr/',
    },
  ],
  relatedCalculators: [
    {
      title: '연봉 계산기',
      href: '/calculators/salary/',
      description: '연봉과 급여 공제 항목을 반영해 실수령액을 추정합니다.',
    },
    {
      title: '월급 계산기',
      href: '/calculators/monthly-salary/',
      description: '월 급여의 예상 공제액과 실수령액을 계산합니다.',
    },
    {
      title: '시급 계산기',
      href: '/calculators/hourly-wage/',
      description: '근무시간과 급여 유형에 따라 시급·주급·월급을 환산합니다.',
    },
    {
      title: '퇴직금 계산기',
      href: '/calculators/severance/',
      description: '평균임금과 계속근로기간을 바탕으로 퇴직금을 계산합니다.',
    },
    {
      title: '연차수당 계산기',
      href: '/calculators/vacation/',
      description: '미사용 연차와 통상임금을 바탕으로 연차수당을 계산합니다.',
    },
  ],
};

export const definition: CalculatorDefinition = {
  slug: 'unemployment',
  title: '실업급여 계산기',
  description:
    '평균임금과 고용보험 가입기간 등을 기준으로 실업급여를 추정합니다.',
  canonical: `https://cozymoney.kr/calculators/unemployment/`,
  category: '급여',
  guidance,
};
