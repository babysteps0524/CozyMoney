import type { ToolKind } from '../../lib/tool/types';

export interface ToolDefinition {
  readonly kind: ToolKind;
  readonly title: string;
  readonly description: string;
  readonly href: `/tools/${string}/`;
}

export const tools: readonly ToolDefinition[] = [
  {
    kind: 'lotto',
    title: '로또 번호 생성기',
    description: '1~45 사이 6개 번호를 무작위로 생성',
    href: '/tools/lotto/',
  },
  {
    kind: 'random',
    title: '랜덤 숫자 생성기',
    description: '원하는 범위의 랜덤 숫자 생성',
    href: '/tools/random/',
  },
  {
    kind: 'picker',
    title: '랜덤 추첨기',
    description: '목록에서 무작위 항목 추첨',
    href: '/tools/picker/',
  },
  {
    kind: 'password',
    title: '비밀번호 생성기',
    description: '조건에 맞는 무작위 비밀번호 생성',
    href: '/tools/password/',
  },
  {
    kind: 'date',
    title: '날짜 계산기',
    description: '두 날짜 사이의 기간 계산',
    href: '/tools/date/',
  },
  {
    kind: 'dday',
    title: 'D-Day 계산기',
    description: '목표 날짜까지 남은 기간 계산',
    href: '/tools/dday/',
  },
  {
    kind: 'age',
    title: '나이 계산기',
    description: '생년월일 기준 만 나이 계산',
    href: '/tools/age/',
  },
  {
    kind: 'unit',
    title: '단위 변환기',
    description: '길이·무게·온도·넓이·데이터 변환',
    href: '/tools/unit/',
  },
  {
    kind: 'percent',
    title: '퍼센트 계산기',
    description: '비율·증감률·할인율·증가율 계산',
    href: '/tools/percent/',
  },
  {
    kind: 'text-counter',
    title: '글자 수 세기',
    description: '공백 포함·제외, 단어·줄 수와 UTF-8 바이트 확인',
    href: '/tools/text-counter/',
  },
];
