// eslint.config.ts
import unocss from '@unocss/eslint-config/flat';
import type { Linter } from 'eslint';

export default [
  unocss,
  {
    rules: {
      // attributify 속성 순서를 자동으로 정렬해 주는 규칙 활성화
      'unocss/order-attributify': 'warn',
      // 기존 클래스 정렬 규칙도 함께 쓰고 싶다면 추가
      'unocss/blocklist': 'warn',
    },
  },
] satisfies Linter.Config[];
