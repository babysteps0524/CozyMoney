import type { CalculatorDefinition } from '../types';
import type { CalculatorDetailsContent } from '../types';

export const guidance: CalculatorDetailsContent = {
  examples: [
    {
      title: '예금 10,000,000원, 연 3%, 1년',
      inputs: '세금과 우대금리를 제외하고 단순 연이율로 계산합니다.',
      result: '세전 이자는 300,000원이며 세전 만기금액은 10,300,000원입니다.',
    },
  ],
  faqs: [
    {
      question: '예금과 적금은 계산 방식이 다른가요?',
      answer:
        '예금은 맡긴 원금 전체에 이자가 붙고, 적금은 납입 시점이 다른 각 회차 금액에 이자가 붙습니다. 같은 금리라도 만기 이자가 다를 수 있습니다.',
    },
    {
      question: '실제 만기 수령액과 왜 다른가요?',
      answer:
        '이자 지급 주기, 납입일, 세금, 우대금리, 중도해지 여부와 상품 약관에 따라 달라질 수 있습니다.',
    },
  ],
  relatedCalculators: [
    {
      title: '복리 계산기',
      href: '/calculators/compound/',
      description: '기간별 이자 재투자 효과를 계산합니다.',
    },
    {
      title: '대출 계산기',
      href: '/calculators/loan/',
      description: '상환 방식에 따른 월 납입액과 총 이자를 계산합니다.',
    },
  ],
};

export const definition: CalculatorDefinition = {
  slug: 'savings',
  title: '예적금 계산기',
  description:
    '예금과 적금의 금리, 기간, 납입 조건을 기준으로 예상 만기금액을 계산합니다.',
  canonical: `https://cozymoney.kr/calculators/savings/`,
  category: '금융',
  guidance,
};
