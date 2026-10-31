import { ActionLogEntry, EmailItem } from '../../../../shared/types';
import { ProtectionEngine } from '../protection/protectionEngine';
import { IEmailProvider } from '../providers/emailProvider';

export class ActionGuardError extends Error {
  public statusCode: number;
  public protectedEmailIds: string[];
  public reasons: string[];

  constructor(message: string, protectedEmailIds: string[], reasons: string[]) {
    super(message);
    this.name = 'ActionGuardError';
    this.statusCode = 403;
    this.protectedEmailIds = protectedEmailIds;
    this.reasons = reasons;
  }
}

export class ActionGuard {
  private undoLogs: Map<string, ActionLogEntry> = new Map();

  /**
   * Validates that NONE of the target emails are protected.
   * If even ONE email is protected, throws an ActionGuardError with HTTP 403.
   */
  public async validateBatchSafety(provider: IEmailProvider, emailIds: string[]): Promise<EmailItem[]> {
    const emailsToProcess: EmailItem[] = [];
    const violations: { id: string; reasons: string[] }[] = [];

    for (const id of emailIds) {
      const email = await provider.getEmail(id);
      if (!email) continue;

      const evalResult = ProtectionEngine.evaluate(email, email.classification?.category, email.classification?.importanceScore);
      if (evalResult.isProtected || email.classification?.isProtected) {
        violations.push({
          id,
          reasons: evalResult.reasons.length > 0 ? evalResult.reasons : (email.classification?.protectionReasons || ['Protected by AI/Rule safety'])
        });
      } else {
        emailsToProcess.push(email);
      }
    }

    if (violations.length > 0) {
      const protectedIds = violations.map(v => v.id);
      const allReasons = Array.from(new Set(violations.flatMap(v => v.reasons)));
      throw new ActionGuardError(
        `Action rejected (HTTP 403 Forbidden): Cannot archive or alter ${violations.length} protected email(s). Kingdom relics and critical documents are inviolable!`,
        protectedIds,
        allReasons
      );
    }

    return emailsToProcess;
  }

  /**
   * Executes a safe batch action: applies label and archives, logging exact previous states for undo.
   */
  public async executeSafeBatchAction(
    provider: IEmailProvider,
    emailIds: string[],
    labelName: string,
    actionType = 'archive_and_label'
  ): Promise<{ success: boolean; modifiedCount: number; undoToken: string }> {
    // 1. Enforce safety (will throw 403 if any protected email is included)
    const validEmails = await this.validateBatchSafety(provider, emailIds);
    if (validEmails.length === 0) {
      return { success: true, modifiedCount: 0, undoToken: '' };
    }

    const validIds = validEmails.map(e => e.id);

    // 2. Snapshot previous state for perfect rollback
    const previousStates = validEmails.map(e => ({
      emailId: e.id,
      labels: [...e.labels]
    }));

    // 3. Execute allowed actions: Apply Label & Archive
    await provider.applyLabel(validIds, labelName);
    await provider.archiveEmails(validIds);

    // 4. Record Undo Log Entry
    const undoToken = `undo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const logEntry: ActionLogEntry = {
      id: undoToken,
      timestamp: new Date().toISOString(),
      actionType,
      affectedEmailIds: validIds,
      labelName,
      undoable: true,
      previousStates
    };
    this.undoLogs.set(undoToken, logEntry);

    return {
      success: true,
      modifiedCount: validIds.length,
      undoToken
    };
  }

  /**
   * Executes an Undo operation, restoring all emails to their prior labels and inbox status.
   */
  public async executeUndo(provider: IEmailProvider, undoToken: string): Promise<{ success: boolean; restoredCount: number }> {
    const entry = this.undoLogs.get(undoToken);
    if (!entry) {
      throw new Error(`Undo token "${undoToken}" not found or expired.`);
    }

    if (!entry.undoable) {
      throw new Error('This action has already been undone.');
    }

    // Rollback label
    await provider.removeLabel(entry.affectedEmailIds, entry.labelName);

    // Rollback inbox status for emails that originally had INBOX
    const shouldReunarchive = entry.previousStates
      .filter(s => s.labels.includes('INBOX'))
      .map(s => s.emailId);

    if (shouldReunarchive.length > 0) {
      await provider.unarchiveEmails(shouldReunarchive);
    }

    entry.undoable = false;
    return {
      success: true,
      restoredCount: entry.affectedEmailIds.length
    };
  }

  public getUndoEntry(undoToken: string): ActionLogEntry | undefined {
    return this.undoLogs.get(undoToken);
  }

  public getRecentUndoLogs(): ActionLogEntry[] {
    return Array.from(this.undoLogs.values())
      .filter(l => l.undoable)
      .slice(-10)
      .reverse();
  }
}
