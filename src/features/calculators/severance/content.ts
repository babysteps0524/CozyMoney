import type { CalculatorDefinition } from '../types';
import type { CalculatorDetailsContent } from '../types';

export const guidance: CalculatorDetailsContent = {
  examples: [
    {
      title: '1일 평균임금 100,000원, 계속근로 365일',
      inputs: '퇴직소득세와 별도 공제는 반영하지 않는 단순 예시입니다.',
      result:
        '기본 산식에 따른 예상 퇴직금은 100,000원 × 30일 × 365 ÷ 365 = 3,000,000원입니다.',
    },
  ],
  faqs: [
    {
      question: '퇴직금은 마지막 월급만으로 계산하나요?',
      answer:
        '일반적으로 퇴직 전 일정 기간의 임금으로 계산한 평균임금과 계속근로기간을 사용합니다. 임금 항목과 제외 기간 등 실제 적용 기준을 확인해야 합니다.',
    },
    {
      question: '계산 결과가 실제 지급액과 다른 이유는 무엇인가요?',
      answer:
        '평균임금 산정에 포함되는 임금, 계속근로기간, 지급 요건과 퇴직소득세 등이 개인별로 다를 수 있습니다.',
    },
  ],
  basis:
    '퇴직금 산정은 근로자퇴직급여 보장법상 지급 요건과 평균임금 산정 기준을 따릅니다. 예외 기간이나 임금 항목의 포함 여부는 개별 근로관계에 따라 확인해야 합니다.',
  sources: [
    {
      title: '근로자퇴직급여 보장법 제8조(퇴직금제도의 설정 등)',
      href: 'https://law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1023689743',
    },
  ],
  relatedCalculators: [
    {
      title: '연봉 계산기',
      href: '/calculators/salary/',
      description: '연봉·월급과 공제 항목을 반영해 실수령액을 추정합니다.',
    },
    {
      title: '연차수당 계산기',
      href: '/calculators/vacation/',
      description: '미사용 연차와 통상임금을 바탕으로 연차수당을 계산합니다.',
    },
  ],
};

export const definition: CalculatorDefinition = {
  slug: 'severance',
  title: '퇴직금 계산기',
  description: '평균임금과 계속근로기간을 기준으로 예상 퇴직금을 계산합니다.',
  canonical: `https://cozymoney.kr/calculators/severance/`,
  category: '급여',
  guidance,
};
