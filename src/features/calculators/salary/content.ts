import type { CalculatorDefinition } from '../types';
import type { CalculatorDetailsContent } from '../types';

export const guidance: CalculatorDetailsContent = {
  examples: [
    {
      title: '연봉 40,000,000원 입력 예시',
      inputs: '퇴직금 포함 여부, 비과세액, 부양가족과 급여 조건을 입력합니다.',
      result:
        '결과에서 월 환산 급여와 공제 항목별 예상액, 월 실수령액을 확인합니다.',
    },
  ],
  faqs: [
    {
      question: '연봉에 퇴직금이 포함되어 있는지 어떻게 입력하나요?',
      answer:
        '근로계약서나 연봉 안내에 표시된 금액 기준으로 포함 여부를 선택해야 월 환산 급여가 올바르게 비교됩니다.',
    },
    {
      question: '계산 결과를 급여명세서 금액으로 보면 되나요?',
      answer:
        '예상 비교값으로 활용하세요. 실제 공제액은 보험 자격, 과세 대상 급여, 가족 공제 조건과 회사의 급여 처리에 따라 다를 수 있습니다.',
    },
  ],
  cautions: [
    '4대보험 부담액과 소득세는 적용 연도, 보수월액, 가입 상태와 가족 공제 조건에 따라 달라집니다.',
    '실제 급여명세서와 연말정산 결과를 대신하지 않는 참고용 추정치입니다.',
  ],
  basis:
    '이 계산기는 입력한 급여와 비과세액, 가족 조건에 따라 2026년 기준의 보험료와 소득세를 추정합니다. 소득세는 국세청 근로소득 간이세액표의 실제 원천징수액과 다를 수 있으므로 급여 담당자와 최신 기준을 확인하세요.',
  relatedCalculators: [
    {
      title: '월급 계산기',
      href: '/calculators/monthly-salary/',
      description: '월 급여와 가족 조건을 기준으로 예상 실수령액을 계산합니다.',
    },
    {
      title: '시급 계산기',
      href: '/calculators/hourly-wage/',
      description: '근무시간과 급여 유형에 따라 시급·주급·월급을 환산합니다.',
    },
  ],
};

export const definition: CalculatorDefinition = {
  slug: 'salary',
  title: '연봉 계산기',
  description: '연봉과 공제 조건을 입력해 예상 월 실수령액을 계산합니다.',
  canonical: `https://cozymoney.kr/calculators/salary/`,
  category: '급여',
  guidance,
};
