import type { ToolKind } from '../../../lib/tool/types';
import type { ToolGuide } from './types';
import age from './age';
import date from './date';
import dday from './dday';
import lotto from './lotto';
import password from './password';
import percent from './percent';
import picker from './picker';
import random from './random';
import unit from './unit';
import textCounter from './text-counter';

export const toolGuides: Record<ToolKind, ToolGuide> = {
  age,
  date,
  dday,
  lotto,
  password,
  percent,
  picker,
  random,
  unit,
  'text-counter': textCounter,
};
