import { describe, it, expect, beforeEach } from 'vitest';
import { ActionGuard, ActionGuardError } from '../server/src/services/actions/actionGuard';
import { DemoProvider } from '../server/src/services/providers/demoProvider';

describe('ActionGuard & 403 Protection Enforcement Tests', () => {
  let guard: ActionGuard;
  let provider: DemoProvider;

  beforeEach(() => {
    guard = new ActionGuard();
    provider = new DemoProvider();
  });

  describe('Strict 403 Rejection on Protected Emails', () => {
    it('throws ActionGuardError with HTTP 403 if any email is protected', async () => {
      // demo-edu-001 is a Stanford final exam notice (Protected Royal Scroll)
      const protectedId = 'demo-edu-001';
      const spamId = 'demo-spam-001';

      await expect(
        guard.executeSafeBatchAction(provider, [spamId, protectedId], 'InboxQuest/Spam')
      ).rejects.toThrow(ActionGuardError);

      try {
        await guard.executeSafeBatchAction(provider, [spamId, protectedId], 'InboxQuest/Spam');
      } catch (err: any) {
        expect(err.statusCode).toBe(403);
        expect(err.protectedEmailIds).toContain(protectedId);
        expect(err.message).toContain('HTTP 403 Forbidden');
      }
    });

    it('rejects action on Job Offers and Internship letters with 403', async () => {
      const jobOfferId = 'demo-career-001'; // Google Offer Letter
      await expect(
        guard.executeSafeBatchAction(provider, [jobOfferId], 'InboxQuest/Promotions')
      ).rejects.toThrow(ActionGuardError);
    });

    it('rejects action on OTP Security codes with 403', async () => {
      const otpId = 'demo-otp-001'; // Google verification code
      await expect(
        guard.executeSafeBatchAction(provider, [otpId], 'InboxQuest/Spam')
      ).rejects.toThrow(ActionGuardError);
    });
  });

  describe('Safe Clutter Actions & Reversible Undo', () => {
    it('successfully archives and labels non-protected spam emails', async () => {
      const spamIds = ['demo-spam-001', 'demo-spam-002'];
      const label = 'InboxQuest/Spam';

      const result = await guard.executeSafeBatchAction(provider, spamIds, label);
      expect(result.success).toBe(true);
      expect(result.modifiedCount).toBe(2);
      expect(result.undoToken).toBeDefined();

      // Check provider email state
      const email1 = await provider.getEmail(spamIds[0]);
      expect(email1?.labels).toContain(label);
      expect(email1?.labels).not.toContain('INBOX');
      expect(email1?.labels).toContain('ARCHIVED');
    });

    it('reverses the action with Undo, restoring labels and inbox state', async () => {
      const promoIds = ['demo-promo-001', 'demo-promo-002'];
      const label = 'InboxQuest/Promotions';

      // 1. Execute safe batch
      const batchResult = await guard.executeSafeBatchAction(provider, promoIds, label);

      // Verify archived
      let email1 = await provider.getEmail(promoIds[0]);
      expect(email1?.labels).toContain(label);

      // 2. Execute Undo
      const undoResult = await guard.executeUndo(provider, batchResult.undoToken);
      expect(undoResult.success).toBe(true);
      expect(undoResult.restoredCount).toBe(2);

      // Verify restored
      email1 = await provider.getEmail(promoIds[0]);
      expect(email1?.labels).not.toContain(label);
      expect(email1?.labels).toContain('INBOX');
      expect(email1?.labels).not.toContain('ARCHIVED');
    });

    it('prevents double undo on the same token', async () => {
      const spamIds = ['demo-spam-003'];
      const res = await guard.executeSafeBatchAction(provider, spamIds, 'InboxQuest/Spam');

      await guard.executeUndo(provider, res.undoToken);

      await expect(guard.executeUndo(provider, res.undoToken)).rejects.toThrow(
        'already been undone'
      );
    });
  });

  describe('Zero Destructive API Guarantees', () => {
    it('confirms provider interface contains zero delete or trash methods', () => {
      // The IEmailProvider contract only has archive, unarchive, applyLabel, removeLabel
      const providerMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(provider));
      expect(providerMethods.includes('deleteMessage')).toBe(false);
      expect(providerMethods.includes('trashMessage')).toBe(false);
      expect(providerMethods.includes('permanentlyDelete')).toBe(false);
    });
  });
});
