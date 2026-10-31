import { describe, it, expect } from 'vitest';
import { ProtectionEngine } from '../server/src/services/protection/protectionEngine';
import { EmailItem } from '../shared/types';

describe('ProtectionEngine Unit Tests', () => {
  const createMockEmail = (overrides: Partial<EmailItem> = {}): EmailItem => ({
    id: 'mock-1',
    threadId: 'thread-1',
    sender: 'Sender <sender@example.com>',
    senderEmail: 'sender@example.com',
    recipient: 'me@example.com',
    subject: 'General Subject',
    snippet: 'General snippet body',
    date: new Date().toISOString(),
    labels: ['INBOX'],
    isUnread: true,
    ...overrides
  });

  describe('Academic & College Rules', () => {
    it('protects emails from .edu or university domains', () => {
      const email = createMockEmail({
        senderEmail: 'admissions@stanford.edu',
        sender: 'Stanford Admissions <admissions@stanford.edu>'
      });
      const result = ProtectionEngine.evaluate(email);
      expect(result.isProtected).toBe(true);
      expect(result.reasons.some(r => r.includes('institution domain'))).toBe(true);
      expect(result.relicType).toBe('ROYAL_SCROLL');
    });

    it('protects emails containing college examination keywords', () => {
      const email = createMockEmail({
        subject: 'Final Semester Examination Schedule & Hall Ticket',
        snippet: 'Please verify your examination hall seating arrangement.'
      });
      const result = ProtectionEngine.evaluate(email);
      expect(result.isProtected).toBe(true);
      expect(result.reasons.some(r => r.includes('Academic/College'))).toBe(true);
    });
  });

  describe('Career & Job Offer Rules', () => {
    it('protects employment offer letters and salary proposals', () => {
      const email = createMockEmail({
        subject: 'Formal Offer Letter: Software Engineer III',
        snippet: 'We are delighted to extend an employment offer with compensation details.'
      });
      const result = ProtectionEngine.evaluate(email);
      expect(result.isProtected).toBe(true);
      expect(result.reasons.some(r => r.includes('Career / Placement / Job offer'))).toBe(true);
      expect(result.relicType).toBe('KNOWLEDGE_CRYSTAL');
    });

    it('protects internship interview invitations', () => {
      const email = createMockEmail({
        subject: 'Summer Internship Technical Interview Round 2',
        snippet: 'Please confirm your interview availability.'
      });
      const result = ProtectionEngine.evaluate(email);
      expect(result.isProtected).toBe(true);
    });
  });

  describe('Banking, Finance & OTP Rules', () => {
    it('protects bank statements and credit card alerts', () => {
      const email = createMockEmail({
        subject: 'Monthly Bank Statement for Checking Account',
        snippet: 'Your electronic statement is ready for review.'
      });
      const result = ProtectionEngine.evaluate(email);
      expect(result.isProtected).toBe(true);
      expect(result.relicType).toBe('GOLDEN_RELIC');
    });

    it('protects 2FA and OTP security codes', () => {
      const email = createMockEmail({
        subject: 'Your Google Verification Code is 918204',
        snippet: 'Do not share your one-time password with anyone.'
      });
      const result = ProtectionEngine.evaluate(email);
      expect(result.isProtected).toBe(true);
      expect(result.reasons.some(r => r.includes('OTP / 2FA'))).toBe(true);
    });
  });

  describe('AI Category Integration', () => {
    it('protects when AI identifies Critical or Education category', () => {
      const email = createMockEmail({ subject: 'Important Notice' });
      const result = ProtectionEngine.evaluate(email, 'Education');
      expect(result.isProtected).toBe(true);
      expect(result.reasons.some(r => r.includes('Education'))).toBe(true);
    });

    it('protects when AI importance score exceeds threshold', () => {
      const email = createMockEmail({ subject: 'Important Project Update' });
      const result = ProtectionEngine.evaluate(email, 'Personal', 85);
      expect(result.isProtected).toBe(true);
      expect(result.reasons.some(r => r.includes('High AI importance priority score'))).toBe(true);
    });

    it('does NOT protect standard marketing promotions or spam', () => {
      const email = createMockEmail({
        subject: 'Flash Sale: 50% Off Sneakers',
        snippet: 'Buy now before discounts end tonight!'
      });
      const result = ProtectionEngine.evaluate(email, 'Promotion', 10);
      expect(result.isProtected).toBe(false);
      expect(result.reasons.length).toBe(0);
    });
  });
});
