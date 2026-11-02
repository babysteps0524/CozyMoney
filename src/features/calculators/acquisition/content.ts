import type { CalculatorDefinition } from '../types';
import type { CalculatorDetailsContent } from '../types';

export const guidance: CalculatorDetailsContent = {
  intro:
    '부동산 취득가액과 취득원인, 주택 수 등 입력 조건을 기준으로 취득세와 주요 지방세 부가세목을 참고용으로 계산합니다.',
  steps: [
    '취득 당시 가액과 주택 수, 취득원인 등 사실관계를 입력합니다.',
    '취득가액 구간과 입력 조건에 따른 취득세율을 적용합니다.',
    '지방교육세·농어촌특별세와 적용 감면을 반영해 예상 세액을 확인합니다.',
  ],
  formula:
    '취득세 = 과세표준 × 적용 취득세율. 총 취득 관련 세금 = 취득세 + 지방교육세 + 농어촌특별세 − 적용 감면.',
  basis:
    '기본세율과 주택 중과는 지방세법, 감면은 지방세특례제한법 등 관련 법령을 기준으로 합니다. 취득일 현재 시행되는 규정과 위택스의 최신 안내를 우선 확인해야 합니다.',
  cautions: [
    '6억원 초과 9억원 이하 주택은 취득가액에 따른 법정 산식으로 세율이 달라질 수 있습니다.',
    '일시적 2주택, 저가주택, 중과 배제 주택과 생애최초 감면 등은 별도 법정 요건을 확인해야 합니다.',
    '취득세 외 등기비용, 국민주택채권, 법무사 비용 등은 포함하지 않습니다.',
    '계산 결과는 신고를 대신하지 않으며 실제 신고 전 관할 지방자치단체 또는 위택스에서 최종 확인해야 합니다.',
  ],
  examples: [
    {
      title: '5억원 주택, 1주택·중과 제외',
      inputs: '주택을 유상취득하고 중과 대상이 아닌 조건으로 계산합니다.',
      result:
        '취득세율 1%를 적용하면 취득세는 5억원 × 1% = 500만원입니다. 지방교육세와 농어촌특별세는 추가 조건에 따라 달라질 수 있습니다.',
    },
  ],
  faqs: [
    {
      question: '취득가액과 과세표준은 항상 같은가요?',
      answer:
        '항상 같지는 않습니다. 취득 당시 가액에 법정으로 포함되는 비용 등이 반영될 수 있어 실제 신고에서는 과세표준 산정기준을 확인해야 합니다.',
    },
    {
      question: '6억원과 9억원 구간은 어떻게 계산하나요?',
      answer:
        '6억원 이하는 1%, 9억원 초과는 3%이며, 6억원 초과 9억원 이하는 취득가액에 따른 법정 산식으로 세율을 계산합니다.',
    },
    {
      question: '주택이 여러 채면 무조건 중과되나요?',
      answer:
        '아닙니다. 일시적 2주택, 저가주택, 중과 배제 주택 등 예외가 있으므로 취득 당시의 전체 사실관계를 함께 확인해야 합니다.',
    },
    {
      question: '생애최초 감면은 누구에게 적용되나요?',
      answer:
        '본인과 배우자의 주택 소유 이력, 주택가액, 거주 목적 등 법정 요건을 충족해야 합니다. 적용 시점의 최신 감면 규정을 확인하세요.',
    },
    {
      question: '실제 신고금액과 다를 수 있나요?',
      answer:
        '네. 취득일, 과세표준, 중과 제외, 감면과 같은 사실관계에 따라 결과가 달라질 수 있습니다.',
    },
  ],
  sources: [
    {
      title: '지방세법',
      href: 'https://www.law.go.kr/법령/지방세법',
    },
    {
      title: '지방세특례제한법',
      href: 'https://www.law.go.kr/법령/지방세특례제한법',
    },
    {
      title: '위택스',
      href: 'https://www.wetax.go.kr/',
    },
  ],
  relatedCalculators: [
    {
      title: '재산세 계산기',
      href: '/calculators/property/',
      description: '부동산 보유에 따른 재산세를 참고용으로 계산합니다.',
    },
    {
      title: '법무사 보수 계산기',
      href: '/calculators/legal-scrivener/',
      description: '소유권이전등기 관련 법무사 보수를 계산합니다.',
    },
    {
      title: '대출 계산기',
      href: '/calculators/loan/',
      description: '주택 구입자금 대출의 상환액과 이자를 계산합니다.',
    },
    {
      title: 'DTI 계산기',
      href: '/calculators/dti/',
      description: '소득 대비 주택담보대출 상환부담을 계산합니다.',
    },
  ],
};

export const definition: CalculatorDefinition = {
  slug: 'acquisition',
  title: '취득세 계산기',
  description:
    '취득세 계산기로 주택 취득가액과 취득원인, 보유 주택 수, 조정대상지역 및 생애최초 감면 조건을 입력해 취득세와 지방교육세 등 예상 세액을 확인하세요. 실제 세액은 취득일의 법령과 감면 요건에 따라 달라질 수 있습니다.',
  canonical: `https://cozymoney.kr/calculators/acquisition/`,
  category: '부동산·세금',
  guidance,
};
