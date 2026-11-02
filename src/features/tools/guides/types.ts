export interface ToolGuide {
  readonly purpose: string;
  readonly steps: readonly string[];
  readonly details: readonly string[];
  readonly faqs: readonly {
    readonly question: string;
    readonly answer: string;
  }[];
}
