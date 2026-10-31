import { EmailItem } from '../../../../shared/types';
import { ALL_DEMO_EMAILS } from '../../data/sampleEmails';
import { EmailListResult, IEmailProvider } from './emailProvider';

export class DemoProvider implements IEmailProvider {
  private emails: EmailItem[];
  private revision: number = 1;

  constructor() {
    // Deep copy sample emails so changes don't mutate template
    this.emails = JSON.parse(JSON.stringify(ALL_DEMO_EMAILS));
  }

  public async listEmails(options?: { pageToken?: string; limit?: number; search?: string }): Promise<EmailListResult> {
    const limit = options?.limit || 50;
    const offset = options?.pageToken ? parseInt(options.pageToken, 10) : 0;
    let filtered = [...this.emails];

    if (options?.search) {
      const q = options.search.toLowerCase();
      filtered = filtered.filter(e =>
        e.subject.toLowerCase().includes(q) ||
        e.sender.toLowerCase().includes(q) ||
        e.snippet.toLowerCase().includes(q)
      );
    }

    const paginated = filtered.slice(offset, offset + limit);
    const nextOffset = offset + limit < filtered.length ? String(offset + limit) : undefined;

    return {
      emails: paginated,
      nextPageToken: nextOffset,
      totalCount: filtered.length
    };
  }

  public async getEmail(id: string): Promise<EmailItem | null> {
    const item = this.emails.find(e => e.id === id);
    return item ? JSON.parse(JSON.stringify(item)) : null;
  }

  public async archiveEmails(ids: string[]): Promise<{ success: boolean; modifiedIds: string[] }> {
    const modified: string[] = [];
    const idSet = new Set(ids);

    for (const email of this.emails) {
      if (idSet.has(email.id)) {
        email.labels = email.labels.filter(l => l !== 'INBOX');
        if (!email.labels.includes('ARCHIVED')) {
          email.labels.push('ARCHIVED');
        }
        modified.push(email.id);
      }
    }

    if (modified.length > 0) this.revision++;
    return { success: true, modifiedIds: modified };
  }

  public async applyLabel(ids: string[], labelName: string): Promise<{ success: boolean; modifiedIds: string[] }> {
    const modified: string[] = [];
    const idSet = new Set(ids);

    for (const email of this.emails) {
      if (idSet.has(email.id)) {
        if (!email.labels.includes(labelName)) {
          email.labels.push(labelName);
        }
        modified.push(email.id);
      }
    }

    if (modified.length > 0) this.revision++;
    return { success: true, modifiedIds: modified };
  }

  public async removeLabel(ids: string[], labelName: string): Promise<{ success: boolean; modifiedIds: string[] }> {
    const modified: string[] = [];
    const idSet = new Set(ids);

    for (const email of this.emails) {
      if (idSet.has(email.id)) {
        email.labels = email.labels.filter(l => l !== labelName);
        modified.push(email.id);
      }
    }

    if (modified.length > 0) this.revision++;
    return { success: true, modifiedIds: modified };
  }

  public async unarchiveEmails(ids: string[]): Promise<{ success: boolean; modifiedIds: string[] }> {
    const modified: string[] = [];
    const idSet = new Set(ids);

    for (const email of this.emails) {
      if (idSet.has(email.id)) {
        email.labels = email.labels.filter(l => l !== 'ARCHIVED');
        if (!email.labels.includes('INBOX')) {
          email.labels.push('INBOX');
        }
        modified.push(email.id);
      }
    }

    if (modified.length > 0) this.revision++;
    return { success: true, modifiedIds: modified };
  }

  public async archiveAndLabelEmails(ids: string[], labelName: string): Promise<{ success: boolean; modifiedIds: string[] }> {
    await this.applyLabel(ids, labelName);
    const res = await this.archiveEmails(ids);
    this.revision++;
    return res;
  }

  public async unarchiveAndRemoveLabelEmails(ids: string[], labelName: string): Promise<{ success: boolean; modifiedIds: string[] }> {
    await this.removeLabel(ids, labelName);
    const res = await this.unarchiveEmails(ids);
    this.revision++;
    return res;
  }

  public async getHistoryId(): Promise<string | undefined> {
    return String(this.revision);
  }

  public async checkChanges(startHistoryId: string): Promise<{ hasChanges: boolean; newHistoryId?: string }> {
    const hasChanges = String(this.revision) !== startHistoryId;
    return { hasChanges, newHistoryId: String(this.revision) };
  }

  public bumpVersion(): void {
    this.revision++;
  }

  public reset(): void {
    this.emails = JSON.parse(JSON.stringify(ALL_DEMO_EMAILS));
    this.revision++;
  }
}
