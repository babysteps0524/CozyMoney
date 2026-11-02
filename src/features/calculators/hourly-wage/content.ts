import type { CalculatorDefinition } from '../types';
import type { CalculatorGuidance } from '../types';

export const guidance: CalculatorGuidance = {
  intro:
    '시급·일급·주급·월급·연봉 중 하나를 입력하고 근무시간, 주휴수당, 연장근로, 세금, 수습 적용 여부를 반영해 예상 급여를 계산합니다.',
  steps: [
    '급여 형태와 금액을 선택한 뒤 일일 근무시간과 근무일수를 입력합니다.',
    '주휴수당과 주·월 연장근로 시간을 선택하고 필요하면 세금과 수습을 적용합니다.',
    '예상 시급·일급·주급·월급·연봉과 최종 환산금액을 확인합니다.',
  ],
  formula:
    '주휴수당 = (주 소정근로시간 ÷ 40) × 8 × 시급. 연장수당은 연장시간 × 시급 × 1.5를 기준으로 단순 계산합니다.',
  basis:
    '급여는 한 달을 약 4.34주로 가정하여 월 환산 방식을 참고한 참고용 계산입니다. 2026년 최저임금은 시간급 10,320원입니다.',
  cautions: [
    '주휴수당은 주 15시간 이상 소정근로 및 개근 등 실제 요건을 충족하는 경우에 발생합니다.',
    '연장근로 가산수당은 사업장 규모와 근로조건 등에 따라 실제 적용이 달라질 수 있습니다.',
    '4대보험 9.7174%와 소득세 3.3%는 간편 추정값이며 실제 원천징수액과 다를 수 있습니다.',
  ],
  examples: [
    {
      title: '시급 12,000원, 하루 8시간, 주 5일',
      inputs: '연장근로 없이 주휴수당 포함 여부를 선택해 계산합니다.',
      result:
        '기본 주급은 480,000원이며, 주휴수당·세금·수습 반영 결과는 선택한 조건에 따라 달라집니다.',
    },
  ],
  faqs: [
    {
      question: '월급이나 연봉을 시급으로 환산할 수 있나요?',
      answer:
        '급여 유형을 선택하고 근무시간과 근무일수 등 환산 조건을 입력하면 비교 가능한 급여 단위로 환산합니다.',
    },
    {
      question: '실제 급여명세서와 왜 차이가 나나요?',
      answer:
        '근로계약, 사업장 규모, 보험 자격, 비과세 항목과 원천징수 기준 등이 다를 수 있습니다. 실제 급여명세서와 계약 조건을 확인하세요.',
    },
  ],
  relatedCalculators: [
    {
      title: '주휴수당 계산기',
      href: '/calculators/weekly/',
      description: '주 소정근로시간과 주휴수당을 반영해 주급을 계산합니다.',
    },
    {
      title: '월급 계산기',
      href: '/calculators/monthly-salary/',
      description: '월 급여의 예상 공제액과 실수령액을 확인합니다.',
    },
    {
      title: '연봉 계산기',
      href: '/calculators/salary/',
      description: '연봉과 급여 공제 항목을 입력해 실수령액을 계산합니다.',
    },
  ],
};

export const definition: CalculatorDefinition = {
  slug: 'hourly-wage',
  title: '시급 계산기',
  description: '시급과 근무 조건을 기준으로 주급, 월급, 연봉을 환산합니다.',
  canonical: `https://cozymoney.kr/calculators/hourly-wage/`,
  category: '급여',
  guidance,
};
