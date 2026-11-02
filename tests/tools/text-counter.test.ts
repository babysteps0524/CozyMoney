import { describe, expect, test } from 'bun:test';
import { countText } from '../../src/features/tools/text-counter/text-counter';

describe('text counter tool', () => {
  test('counts characters, whitespace, words, lines, paragraphs, bytes, and Korean syllables', () => {
    expect(countText('안녕 world\n\n반가워')).toEqual({
      characters: 13,
      charactersWithoutWhitespace: 10,
      words: 3,
      lines: 3,
      paragraphs: 2,
      utf8Bytes: 23,
      koreanSyllables: 5,
    });
  });

  test('returns zero counts for empty input', () => {
    expect(countText('')).toEqual({
      characters: 0,
      charactersWithoutWhitespace: 0,
      words: 0,
      lines: 0,
      paragraphs: 0,
      utf8Bytes: 0,
      koreanSyllables: 0,
    });
  });

  test('counts supplementary Unicode code points as one character', () => {
    expect(countText('A😀B').characters).toBe(3);
    expect(countText('A😀B').utf8Bytes).toBe(6);
  });

  test('counts CRLF as one line break', () => {
    expect(countText('첫째\r\n둘째').lines).toBe(2);
  });
});
