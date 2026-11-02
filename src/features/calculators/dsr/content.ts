import type { CalculatorDefinition } from '../types';
import type { CalculatorGuidance } from '../types';

export const guidance: CalculatorGuidance = {
  intro:
    'DSR은 연소득에 비해 1년 동안 갚아야 하는 대출 원리금이 어느 정도인지 보는 비율입니다.',
  steps: [
    '연소득을 확인합니다.',
    '기존 대출과 신규 대출의 연간 원리금 상환액을 합산합니다.',
    '합산한 연간 원리금을 연소득으로 나누고 100을 곱합니다.',
  ],
  formula: 'DSR(%) = 연간 원리금 상환액 ÷ 연소득 × 100.',
  basis:
    '실제 금융기관은 금융당국의 가계대출 관리기준과 금융회사별 심사기준을 함께 적용합니다.',
  cautions: [
    '대출 종류와 상환기간, 금리, 소득 인정방법에 따라 실제 심사값이 달라질 수 있습니다.',
    '이 결과만으로 대출 가능 여부를 판단할 수 없습니다.',
  ],
  examples: [
    {
      title: '연소득 5,000만 원, 연간 원리금 2,000만 원',
      inputs:
        '기존 대출과 신규 대출의 연간 원리금 합계가 2,000만 원이라고 가정합니다.',
      result: 'DSR은 2,000만 원 ÷ 5,000만 원 × 100 = 40%입니다.',
    },
  ],
  faqs: [
    {
      question: 'DSR과 DTI는 어떻게 다른가요?',
      answer:
        '이 계산기의 DSR은 모든 대출의 연간 원리금을 소득과 비교합니다. DTI는 일반적으로 주택담보대출 원리금과 기타 대출 이자 등을 구분해 살펴보므로 입력 기준과 적용 규정을 확인해야 합니다.',
    },
    {
      question: '계산 결과만으로 대출 한도를 알 수 있나요?',
      answer:
        '아니요. 실제 한도는 금융기관의 소득 인정, 부채 산정, 담보 가치와 심사 기준을 함께 적용해 결정됩니다.',
    },
  ],
  relatedCalculators: [
    {
      title: 'DTI 계산기',
      href: '/calculators/dti/',
      description: '주택담보대출과 다른 부채의 부담을 비교합니다.',
    },
    {
      title: '대출 계산기',
      href: '/calculators/loan/',
      description: '대출 조건별 예상 상환액을 계산합니다.',
    },
  ],
};

export const definition: CalculatorDefinition = {
  slug: 'dsr',
  title: 'DSR 계산기',
  description: '연소득과 대출 원리금을 기준으로 DSR을 계산합니다.',
  canonical: `https://cozymoney.kr/calculators/dsr/`,
  category: '금융',
  guidance,
};
