import type { CalculatorDefinition } from '../types';
import type { CalculatorGuidance } from '../types';

export const guidance: CalculatorGuidance = {
  intro:
    '시급과 주 소정근로시간을 이용해 주급, 주휴수당, 두 금액의 합산 금액을 각각 추정합니다.',
  steps: [
    '시급과 주 소정근로시간을 입력합니다.',
    '기본 주급과 추정 주휴수당을 각각 계산합니다.',
    '주급과 주휴수당을 합산한 금액도 별도로 확인합니다.',
  ],
  formula:
    '기본 주급 = 시급 × 주 소정근로시간. 추정 주휴수당 = 시급 × 주휴시간(주 15시간 이상일 때 최대 8시간으로 단순 가정). 합산 금액 = 기본 주급 + 추정 주휴수당.',
  basis:
    '주휴 관련 판단은 근로기준법 제55조 등 관련 규정과 고용노동부 안내를 확인해야 합니다.',
  cautions: [
    '소정근로일 개근 여부와 근로시간 등 실제 조건에 따라 달라집니다.',
    '주휴수당은 법정 지급 요건을 충족한다고 가정한 단순 추정치이며, 실제 근로계약과 임금항목을 확인해야 합니다.',
  ],
  examples: [
    {
      title: '시급 10,000원, 주 40시간 근무',
      inputs: '주휴수당 지급 요건을 충족한다고 가정합니다.',
      result:
        '기본 주급 400,000원, 추정 주휴수당 80,000원, 합산 금액 480,000원으로 각각 표시합니다.',
    },
  ],
  faqs: [
    {
      question: '주휴수당은 자동으로 받을 수 있나요?',
      answer:
        '근로시간과 소정근로일 개근 등 법정 요건을 충족해야 합니다. 이 계산 결과만으로 지급 요건이 확정되지는 않습니다.',
    },
    {
      question: '세후 주급인가요?',
      answer:
        '세금 공제 전 금액을 기준으로 계산합니다. 실제 공제액은 보험 가입 상태와 급여 항목 등에 따라 달라질 수 있습니다.',
    },
  ],
  relatedCalculators: [
    {
      title: '시급 계산기',
      href: '/calculators/hourly-wage/',
      description: '시급·주급·월급·연봉을 근무 조건과 함께 환산합니다.',
    },
    {
      title: '월급 계산기',
      href: '/calculators/monthly-salary/',
      description: '월 급여에서 예상 공제액과 실수령액을 계산합니다.',
    },
  ],
};

export const definition: CalculatorDefinition = {
  slug: 'weekly',
  title: '주휴수당 계산기',
  description:
    '시급과 주 소정근로시간을 이용해 주급, 주휴수당, 합산 금액을 각각 계산합니다.',
  canonical: 'https://cozymoney.kr/calculators/weekly/',
  category: '급여',
  guidance,
};
