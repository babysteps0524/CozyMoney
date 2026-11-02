import type { CalculatorDefinition } from '../types';
import type { CalculatorDetailsContent } from '../types';

export const guidance: CalculatorDetailsContent = {
  examples: [
    {
      title: '소유권 이전 등기 과세표준 4억 원',
      inputs: '계산기에 등록된 기본 보수표를 적용하는 예시입니다.',
      result:
        '현재 계산 로직의 기본 보수는 520,000원이며, 부가가치세와 선택한 실비는 별도로 합산됩니다.',
    },
  ],
  faqs: [
    {
      question: '계산된 금액이 법무사 견적과 같은가요?',
      answer:
        '참고용 예상액입니다. 실제 보수와 실비는 등기 업무의 범위, 사건 난이도, 의뢰 조건과 발생 비용에 따라 달라질 수 있습니다.',
    },
    {
      question: '취득세도 합계에 포함되나요?',
      answer:
        '이 계산기는 등기 관련 보수와 선택한 부대 비용을 추정합니다. 취득세는 취득세 계산기에서 별도로 확인하세요.',
    },
  ],
  cautions: [
    '실제 보수와 공과금은 적용 시점의 요율·수수료표와 사건별 업무 범위를 확인해야 합니다.',
    '세금이나 금융기관 비용처럼 계산기에 포함되지 않은 비용이 있을 수 있습니다.',
  ],
  basis:
    '기본 보수와 공과금은 계산기에 반영된 요율 및 입력한 등기 종류·과세표준을 기준으로 추정합니다. 실제 위임 계약과 최신 기준을 우선 확인하세요.',
  relatedCalculators: [
    {
      title: '취득세 계산기',
      href: '/calculators/acquisition/',
      description: '부동산 취득 조건에 따른 취득세를 추정합니다.',
    },
    {
      title: '중개보수 계산기',
      href: '/calculators/brokerage/',
      description: '부동산 거래 유형별 중개보수를 계산합니다.',
    },
  ],
};

export const definition: CalculatorDefinition = {
  slug: 'legal-scrivener',
  title: '법무사 보수 계산기',
  description:
    '부동산 등기 과세표준과 계약서 기재금액을 기준으로 법무사 기본보수와 인지·증지 비용을 계산합니다.',
  canonical: `https://cozymoney.kr/calculators/legal-scrivener/`,
  category: '부동산',
  guidance,
};
