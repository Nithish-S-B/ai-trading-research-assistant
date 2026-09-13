export type ClarificationQuestion = {
  id: string;
  field: string;
  question: string;
  reason: string;
  options?: string[];
  allowCustomAnswer: boolean;
};
