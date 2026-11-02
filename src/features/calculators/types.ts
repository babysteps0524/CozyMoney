export interface CalculatorExample {
  title: string;
  inputs: string;
  result: string;
}

export interface CalculatorFaq {
  question: string;
  answer: string;
}

export interface RelatedCalculator {
  title: string;
  href: string;
  description: string;
}

export interface CalculatorSource {
  title: string;
  href: string;
}

export interface CalculatorDetailsContent {
  intro?: string;
  steps?: string[];
  formula?: string;
  examples?: CalculatorExample[];
  cautions?: string[];
  faqs?: CalculatorFaq[];
  basis?: string;
  sources?: CalculatorSource[];
  relatedCalculators?: RelatedCalculator[];
}

export interface CalculatorGuidance extends CalculatorDetailsContent {
  intro: string;
  steps: string[];
  formula: string;
  basis: string;
  cautions: string[];
}

export interface CalculatorDefinition {
  slug: string;
  title: string;
  description: string;
  canonical: string;
  category: string;
  guidance?: CalculatorDetailsContent;
}
