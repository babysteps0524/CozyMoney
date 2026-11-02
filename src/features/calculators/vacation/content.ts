import type { CalculatorDefinition } from '../types';
import type { CalculatorDetailsContent } from '../types';

export const guidance: CalculatorDetailsContent = {
  examples: [
    {
      title: '미사용 연차 8일, 1일 통상임금 100,000원',
      inputs: '입력한 연차일수와 1일 통상임금을 기준으로 계산합니다.',
      result: '세전 연차수당 예시는 8일 × 100,000원 = 800,000원입니다.',
    },
  ],
  faqs: [
    {
      question: '입사일 기준과 회계연도 기준 결과가 다른가요?',
      answer:
        '연차를 산정하는 기준일이 다르면 발생 일수와 첫해 비례 계산이 달라질 수 있습니다. 회사의 운영 기준과 근로조건을 확인하세요.',
    },
    {
      question: '계산된 금액이 실수령액인가요?',
      answer:
        '아닙니다. 결과는 입력한 통상임금과 미사용 일수에 따른 세전 추정액입니다. 실제 지급액은 임금 항목과 세금 처리에 따라 달라질 수 있습니다.',
    },
  ],
  basis:
    '연차 발생과 미사용 연차수당은 근로기준법, 취업규칙과 근로계약 등 적용 조건을 함께 확인해야 합니다. 이 계산기는 입력한 기준일과 임금으로 예상값을 보여줍니다.',
  sources: [
    {
      title: '근로기준법 제60조(연차 유급휴가)',
      href: 'https://law.go.kr/LSW/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1029727971',
    },
  ],
  relatedCalculators: [
    {
      title: '주휴수당 계산기',
      href: '/calculators/weekly/',
      description: '시급과 소정근로시간을 이용해 주급을 계산합니다.',
    },
    {
      title: '월급 계산기',
      href: '/calculators/monthly-salary/',
      description: '월급에서 예상 공제액과 실수령액을 확인합니다.',
    },
  ],
};

export const definition: CalculatorDefinition = {
  slug: 'vacation',
  title: '연차수당 계산기',
  description:
    '미사용 연차일수와 통상임금을 기준으로 예상 연차수당을 계산합니다.',
  canonical: `https://cozymoney.kr/calculators/vacation/`,
  category: '급여',
  guidance,
};
