import { describe, expect, test } from 'bun:test';
import { toolGuides } from '../../src/features/tools/guides';
import { TOOL_KINDS } from '../../src/lib/tool/types';

describe('생활도구 가이드 등록부', () => {
  test('모든 도구에 설명 콘텐츠가 등록되어 있다', () => {
    expect(Object.keys(toolGuides).sort()).toEqual([...TOOL_KINDS].sort());
  });

  test('각 도구 가이드는 사용 방법과 FAQ를 제공한다', () => {
    for (const kind of TOOL_KINDS) {
      const guide = toolGuides[kind];
      expect(guide.purpose.length).toBeGreaterThan(0);
      expect(guide.steps.length).toBeGreaterThanOrEqual(3);
      expect(guide.details.length).toBeGreaterThanOrEqual(2);
      expect(guide.faqs.length).toBeGreaterThanOrEqual(2);
    }
  });
});
