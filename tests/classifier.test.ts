import { describe, it, expect } from 'vitest';
import { RuleClassifier } from '../server/src/services/ai/ruleClassifier';
import { validateClassificationOutput } from '../shared/schemas';
import { EmailItem } from '../shared/types';

describe('Classifier & Fallback Unit Tests', () => {
  const mockEmail = (overrides: Partial<EmailItem> = {}): EmailItem => ({
    id: 'test-email-1',
    threadId: 'test-thread-1',
    sender: 'Test <test@example.com>',
    senderEmail: 'test@example.com',
    recipient: 'me@example.com',
    subject: 'Subject',
    snippet: 'Snippet',
    date: new Date().toISOString(),
    labels: ['INBOX'],
    isUnread: true,
    ...overrides
  });

  describe('Rule-Based Classifier Fallback', () => {
    it('classifies lottery scams as Spam with low importance score', () => {
      const email = mockEmail({
        subject: 'URGENT: You won 4.5 BTC in the lottery sweepstakes',
        snippet: 'Claim your unclaimed inheritance from barrister Williams now.'
      });
      const res = RuleClassifier.classify(email);
      expect(res.category).toBe('Spam');
      expect(res.recommendedAction).toBe('archive');
      expect(res.importanceScore).toBeLessThan(20);
      expect(res.isProtected).toBe(false);
    });

    it('classifies flash sales as Promotion with archive recommendation', () => {
      const email = mockEmail({
        subject: 'FLASH SALE: 40% Off sneakers this weekend only',
        snippet: 'Use coupon code DISCOUNT40 at checkout.'
      });
      const res = RuleClassifier.classify(email);
      expect(res.category).toBe('Promotion');
      expect(res.recommendedAction).toBe('archive');
      expect(res.isProtected).toBe(false);
    });

    it('classifies newsletters as Newsletter category', () => {
      const email = mockEmail({
        sender: 'TLDR Tech <news@tldr.tech>',
        subject: 'TLDR Tech Weekly Digest',
        snippet: 'Here is what happened in software engineering this week.'
      });
      const res = RuleClassifier.classify(email);
      expect(res.category).toBe('Newsletter');
      expect(res.recommendedAction).toBe('archive');
    });

    it('classifies academic notices as Education and marks Protected', () => {
      const email = mockEmail({
        sender: 'Registrar Office <registrar@berkeley.edu>',
        senderEmail: 'registrar@berkeley.edu',
        subject: 'Semester Examination Schedule & Transcript',
        snippet: 'Please verify your grade card and exam schedule.'
      });
      const res = RuleClassifier.classify(email);
      expect(res.category).toBe('Education');
      expect(res.recommendedAction).toBe('keep');
      expect(res.importanceScore).toBeGreaterThanOrEqual(80);
      expect(res.isProtected).toBe(true);
    });

    it('classifies job offers as Work and marks Protected', () => {
      const email = mockEmail({
        subject: 'Official Offer Letter & Internship Onboarding',
        snippet: 'We are thrilled to welcome you to the software engineering team.'
      });
      const res = RuleClassifier.classify(email);
      expect(res.category).toBe('Work');
      expect(res.recommendedAction).toBe('keep');
      expect(res.importanceScore).toBeGreaterThanOrEqual(90);
      expect(res.isProtected).toBe(true);
    });
  });

  describe('Schema Validation', () => {
    it('validates and clamps valid classification output', () => {
      const raw = {
        id: 'msg-123',
        category: 'Promotion',
        importanceScore: 120, // should clamp to 100
        urgencyScore: -10,    // should clamp to 0
        summary: 'A marketing discount email.',
        recommendedAction: 'archive',
        reason: 'Commercial discount.'
      };

      const result = validateClassificationOutput(raw);
      expect(result).not.toBeNull();
      expect(result?.importanceScore).toBe(100);
      expect(result?.urgencyScore).toBe(0);
      expect(result?.category).toBe('Promotion');
      expect(result?.recommendedAction).toBe('archive');
    });

    it('rejects invalid or missing categories', () => {
      const raw = {
        id: 'msg-123',
        category: 'NonExistentCategory',
        summary: 'Something'
      };
      expect(validateClassificationOutput(raw)).toBeNull();
    });

    it('rejects null or non-object inputs', () => {
      expect(validateClassificationOutput(null)).toBeNull();
      expect(validateClassificationOutput('string')).toBeNull();
      expect(validateClassificationOutput(undefined)).toBeNull();
    });
  });
});
