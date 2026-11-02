import type { CalculatorDefinition } from '../types';
import type { CalculatorGuidance } from '../types';

export const guidance: CalculatorGuidance = {
  intro:
    '원금과 연이율을 바탕으로 일정 기간 동안 이자가 다시 원금에 합산되는 복리 효과를 단순 추정합니다.',
  steps: [
    '초기금액에 연이율과 기간을 적용합니다.',
    '추가납입액이 있으면 기간별 납입액도 복리로 증가한다고 가정합니다.',
    '최종금액에서 납입 원금을 빼 이자 부분을 확인합니다.',
  ],
  formula: '기본식은 미래금액 = 원금 × (1 + 연이율)ⁿ입니다.',
  basis:
    '실제 금융상품은 이자 계산일, 납입일, 우대금리, 중도해지 조건 등 상품 약관이 우선합니다.',
  cautions: [
    '세금과 상품별 우대조건은 반영하지 않습니다.',
    '실제 적립식 상품은 납입시점에 따라 이자가 달라질 수 있습니다.',
  ],
  examples: [
    {
      title: '원금 1,000만 원, 연 5%, 3년',
      inputs: '추가 납입 없이 이자를 연 1회 복리로 계산합니다.',
      result: '세전 만기금액은 약 1,157만 6,250원입니다.',
    },
  ],
  faqs: [
    {
      question: '추가 납입도 계산에 포함되나요?',
      answer:
        '추가 납입액과 납입 주기를 입력한 경우 계산에 반영합니다. 납입 시점 가정에 따라 실제 상품 결과와 차이가 날 수 있습니다.',
    },
    {
      question: '세후 이자도 표시되나요?',
      answer:
        '계산 결과의 세금 반영 여부를 확인하세요. 금융상품의 과세와 우대 조건은 상품별 약관에 따라 달라질 수 있습니다.',
    },
  ],
  relatedCalculators: [
    {
      title: '예적금 계산기',
      href: '/calculators/savings/',
      description: '정기예금과 적금의 만기 금액을 비교합니다.',
    },
    {
      title: '대출 계산기',
      href: '/calculators/loan/',
      description: '상환 방식별 월 납입액과 이자를 계산합니다.',
    },
  ],
};

export const definition: CalculatorDefinition = {
  slug: 'compound',
  title: '복리 계산기',
  description: '원금과 금리, 기간을 기준으로 복리 효과를 계산합니다.',
  canonical: `https://cozymoney.kr/calculators/compound/`,
  category: '금융',
  guidance,
};
