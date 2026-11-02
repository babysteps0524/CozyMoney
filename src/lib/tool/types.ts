export const TOOL_KINDS = [
  'lotto',
  'random',
  'picker',
  'password',
  'date',
  'dday',
  'age',
  'unit',
  'percent',
  'text-counter',
] as const;

export type ToolKind = (typeof TOOL_KINDS)[number];

export function isToolKind(value: string | undefined): value is ToolKind {
  return (
    value !== undefined && (TOOL_KINDS as readonly string[]).includes(value)
  );
}
