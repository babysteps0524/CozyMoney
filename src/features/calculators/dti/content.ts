import type { CalculatorDefinition } from '../types';
import type { CalculatorGuidance } from '../types';

export const guidance: CalculatorGuidance = {
  intro:
    '연소득과 주택담보대출 조건, 기타 대출 조건을 입력하면 연간 상환액을 계산해 DTI를 확인합니다.',
  steps: [
    '연소득과 주택담보대출 금액·금리·기간·상환방식을 입력합니다.',
    '주택담보대출의 연간 원금·이자 상환액과 기타 대출의 연간 이자를 계산합니다.',
    '두 금액을 합산해 연소득으로 나누고 DTI와 목표 DTI 대비 여유액을 확인합니다.',
  ],
  formula:
    'DTI(%) = (주택담보대출 연간 원리금 + 기타 대출 연간 이자) ÷ 연소득 × 100.',
  basis:
    'DTI의 기본 구조를 적용한 참고용 계산입니다. 실제 금융기관은 대출 종류, 소득 인정범위, 상환방식과 당시 규정에 따라 산정방법을 달리 적용할 수 있습니다.',
  cautions: [
    '이 계산기는 입력한 대출조건으로 연간 상환액을 추정한 참고용 계산이며 실제 금융기관 심사값과 다를 수 있습니다.',
    '목표 DTI는 사용자가 비교하기 위한 기준값이며 실제 대출 가능 여부나 법정 한도를 의미하지 않습니다.',
  ],
  examples: [
    {
      title: '연소득 5,000만 원, 주택 대출 상환액 1,500만 원',
      inputs: '기타 대출의 연간 이자를 200만 원으로 가정합니다.',
      result: 'DTI는 (1,500만 원 + 200만 원) ÷ 5,000만 원 × 100 = 34%입니다.',
    },
  ],
  faqs: [
    {
      question: '기타 대출 원금도 DTI에 포함되나요?',
      answer:
        '이 계산기는 기타 대출의 연간 이자를 입력해 반영합니다. 실제 금융기관의 DTI 산정 방식은 대출과 적용 규정에 따라 다를 수 있습니다.',
    },
    {
      question: '목표 DTI는 대출 가능 기준인가요?',
      answer:
        '아닙니다. 목표 DTI는 결과를 비교하기 위한 사용자 입력값이며 대출 승인이나 법정 한도를 의미하지 않습니다.',
    },
  ],
  relatedCalculators: [
    {
      title: 'DSR 계산기',
      href: '/calculators/dsr/',
      description: '모든 대출의 연간 원리금 부담을 소득과 비교합니다.',
    },
    {
      title: '대출 계산기',
      href: '/calculators/loan/',
      description: '상환 방식에 따른 대출 납입액을 확인합니다.',
    },
  ],
};

export const definition: CalculatorDefinition = {
  slug: 'dti',
  title: 'DTI 계산기',
  description:
    '연소득과 주택담보대출 원리금, 기타 이자상환액을 기준으로 DTI를 계산합니다.',
  canonical: `https://cozymoney.kr/calculators/dti/`,
  category: '금융',
  guidance,
};
