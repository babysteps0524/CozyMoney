import type { CalculatorDefinition } from '../types';
import { guidance } from '../salary/content';
export { guidance } from '../salary/content';

export const definition: CalculatorDefinition = {
  slug: 'monthly-salary',
  title: '월급 계산기',
  description: '월급과 공제 조건을 입력해 예상 실수령액을 계산합니다.',
  canonical: `https://cozymoney.kr/calculators/monthly-salary/`,
  category: '급여',
  guidance,
};
