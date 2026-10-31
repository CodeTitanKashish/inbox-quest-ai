import { EmailItem } from '../../../../shared/types';

export interface EmailListResult {
  emails: EmailItem[];
  nextPageToken?: string;
  totalCount: number;
}

export interface IEmailProvider {
  listEmails(options?: { pageToken?: string; limit?: number; search?: string }): Promise<EmailListResult>;
  getEmail(id: string): Promise<EmailItem | null>;
  archiveEmails(ids: string[]): Promise<{ success: boolean; modifiedIds: string[] }>;
  applyLabel(ids: string[], labelName: string): Promise<{ success: boolean; modifiedIds: string[] }>;
  removeLabel(ids: string[], labelName: string): Promise<{ success: boolean; modifiedIds: string[] }>;
  unarchiveEmails(ids: string[]): Promise<{ success: boolean; modifiedIds: string[] }>;

  // Real-time atomic modifications
  archiveAndLabelEmails?(ids: string[], labelName: string): Promise<{ success: boolean; modifiedIds: string[] }>;
  unarchiveAndRemoveLabelEmails?(ids: string[], labelName: string): Promise<{ success: boolean; modifiedIds: string[] }>;

  // Real-time synchronization & history tracking
  getHistoryId?(): Promise<string | undefined>;
  checkChanges?(startHistoryId: string): Promise<{ hasChanges: boolean; newHistoryId?: string }>;
}
