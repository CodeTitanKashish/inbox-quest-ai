// We will define typed schemas and validators without strict third-party dependency for maximum portability,
// as well as Zod-compatible validators.

export interface RawAiClassificationOutput {
  id: string;
  category: string;
  importanceScore: number;
  urgencyScore: number;
  summary: string;
  recommendedAction: string;
  reason: string;
  isProtected?: boolean;
  protectionReasons?: string[];
}

export function validateClassificationOutput(obj: any): RawAiClassificationOutput | null {
  if (!obj || typeof obj !== 'object') return null;
  if (typeof obj.id !== 'string') return null;
  if (typeof obj.category !== 'string') return null;
  if (typeof obj.summary !== 'string') return null;
  if (typeof obj.reason !== 'string') return null;

  const validCategories = [
    'Critical', 'Important', 'Education', 'Work', 'Finance',
    'Personal', 'Newsletter', 'Promotion', 'Social', 'Spam'
  ];
  if (!validCategories.includes(obj.category)) return null;

  const validActions = ['keep', 'archive', 'label', 'review'];
  const action = typeof obj.recommendedAction === 'string' && validActions.includes(obj.recommendedAction)
    ? obj.recommendedAction
    : 'review';

  const importanceScore = typeof obj.importanceScore === 'number'
    ? Math.max(0, Math.min(100, Math.round(obj.importanceScore)))
    : 50;

  const urgencyScore = typeof obj.urgencyScore === 'number'
    ? Math.max(0, Math.min(100, Math.round(obj.urgencyScore)))
    : 50;

  return {
    id: obj.id,
    category: obj.category,
    importanceScore,
    urgencyScore,
    summary: obj.summary.slice(0, 200),
    recommendedAction: action,
    reason: obj.reason.slice(0, 300),
    isProtected: Boolean(obj.isProtected),
    protectionReasons: Array.isArray(obj.protectionReasons)
      ? obj.protectionReasons.map((r: any) => String(r).slice(0, 100))
      : []
  };
}
