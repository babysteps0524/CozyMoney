export interface TextStatistics {
  readonly characters: number;
  readonly charactersWithoutWhitespace: number;
  readonly words: number;
  readonly lines: number;
  readonly paragraphs: number;
  readonly utf8Bytes: number;
  readonly koreanSyllables: number;
}

export function countText(text: string): TextStatistics {
  const trimmed = text.trim();

  return {
    characters: Array.from(text).length,
    charactersWithoutWhitespace: Array.from(text.replace(/\s/gu, '')).length,
    words: trimmed ? trimmed.split(/\s+/u).length : 0,
    lines: text.length === 0 ? 0 : text.split(/\r\n|\r|\n/u).length,
    paragraphs: trimmed
      ? trimmed
          .split(/(?:\r\n|\r|\n)[ \t]*(?:(?:\r\n|\r|\n)[ \t]*)+/u)
          .filter((part) => part.trim()).length
      : 0,
    utf8Bytes: new TextEncoder().encode(text).length,
    koreanSyllables: (text.match(/[가-힣]/gu) ?? []).length,
  };
}
