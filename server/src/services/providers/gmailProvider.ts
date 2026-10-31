import { google, gmail_v1 } from 'googleapis';
import { EmailItem } from '../../../../shared/types';
import { EmailListResult, IEmailProvider } from './emailProvider';

export class GmailProvider implements IEmailProvider {
  private gmail: gmail_v1.Gmail;
  private labelCache: Map<string, string> = new Map(); // labelName -> labelId

  constructor(auth: any) {
    this.gmail = google.gmail({ version: 'v1', auth });
  }

  /**
   * Helper to execute Gmail API calls with exponential backoff retry.
   */
  private async retryWithBackoff<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    let delay = 500;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (err: any) {
        const isRateLimit = err.status === 429 || err.code === 429 || (err.message && err.message.includes('Rate Limit'));
        const isServerError = err.status >= 500 && err.status < 600;
        if ((isRateLimit || isServerError) && attempt < maxRetries - 1) {
          console.warn(`Gmail API rate limited / error (attempt ${attempt + 1}). Retrying in ${delay}ms...`);
          await new Promise(res => setTimeout(res, delay));
          delay *= 2;
        } else {
          throw err;
        }
      }
    }
    throw new Error('Max retries exceeded for Gmail API operation');
  }

  public async listEmails(options?: { pageToken?: string; limit?: number; search?: string }): Promise<EmailListResult> {
    const q = options?.search || 'in:inbox';
    const maxResults = options?.limit || 30;

    const listRes = await this.retryWithBackoff(() =>
      this.gmail.users.messages.list({
        userId: 'me',
        q,
        maxResults,
        pageToken: options?.pageToken
      })
    );

    const messageHeaders = listRes.data.messages || [];
    if (messageHeaders.length === 0) {
      return { emails: [], totalCount: 0 };
    }

    // Fetch message metadata in parallel batches of 10
    const emails: EmailItem[] = [];
    const chunkSize = 10;
    for (let i = 0; i < messageHeaders.length; i += chunkSize) {
      const chunk = messageHeaders.slice(i, i + chunkSize);
      const batchPromises = chunk.map(m =>
        this.retryWithBackoff(() =>
          this.gmail.users.messages.get({
            userId: 'me',
            id: m.id!,
            format: 'metadata',
            metadataHeaders: ['From', 'To', 'Subject', 'Date']
          })
        ).catch(err => {
          console.warn(`Failed to fetch message metadata for ${m.id}:`, err.message);
          return null;
        })
      );

      const resolved = await Promise.all(batchPromises);
      for (const res of resolved) {
        if (!res || !res.data) continue;
        const msg = res.data;
        const headers = msg.payload?.headers || [];

        const getHeader = (name: string) =>
          headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

        const from = getHeader('From');
        const emailMatch = from.match(/<([^>]+)>/);
        const senderEmail = emailMatch ? emailMatch[1] : from;

        emails.push({
          id: msg.id || '',
          threadId: msg.threadId || '',
          sender: from || 'Unknown Sender',
          senderEmail,
          recipient: getHeader('To') || 'me',
          subject: getHeader('Subject') || '(No Subject)',
          snippet: msg.snippet || '',
          date: getHeader('Date') ? new Date(getHeader('Date')).toISOString() : new Date().toISOString(),
          labels: msg.labelIds || [],
          isUnread: (msg.labelIds || []).includes('UNREAD')
        });
      }
    }

    return {
      emails,
      nextPageToken: listRes.data.nextPageToken || undefined,
      totalCount: listRes.data.resultSizeEstimate || emails.length
    };
  }

  public async getEmail(id: string): Promise<EmailItem | null> {
    try {
      const res = await this.retryWithBackoff(() =>
        this.gmail.users.messages.get({
          userId: 'me',
          id,
          format: 'metadata',
          metadataHeaders: ['From', 'To', 'Subject', 'Date']
        })
      );

      const msg = res.data;
      const headers = msg.payload?.headers || [];
      const getHeader = (name: string) =>
        headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

      const from = getHeader('From');
      const emailMatch = from.match(/<([^>]+)>/);

      return {
        id: msg.id || '',
        threadId: msg.threadId || '',
        sender: from,
        senderEmail: emailMatch ? emailMatch[1] : from,
        recipient: getHeader('To'),
        subject: getHeader('Subject') || '(No Subject)',
        snippet: msg.snippet || '',
        date: getHeader('Date') ? new Date(getHeader('Date')).toISOString() : new Date().toISOString(),
        labels: msg.labelIds || [],
        isUnread: (msg.labelIds || []).includes('UNREAD')
      };
    } catch {
      return null;
    }
  }

  private async getOrCreateLabelId(labelName: string): Promise<string> {
    if (this.labelCache.has(labelName)) {
      return this.labelCache.get(labelName)!;
    }

    const labelsRes = await this.retryWithBackoff(() =>
      this.gmail.users.labels.list({ userId: 'me' })
    );

    const existing = (labelsRes.data.labels || []).find(
      l => l.name?.toLowerCase() === labelName.toLowerCase()
    );
    if (existing && existing.id) {
      this.labelCache.set(labelName, existing.id);
      return existing.id;
    }

    // Create label if it does not exist
    const createRes = await this.retryWithBackoff(() =>
      this.gmail.users.labels.create({
        userId: 'me',
        requestBody: {
          name: labelName,
          labelListVisibility: 'labelShow',
          messageListVisibility: 'show'
        }
      })
    );

    if (createRes.data.id) {
      this.labelCache.set(labelName, createRes.data.id);
      return createRes.data.id;
    }

    throw new Error(`Failed to resolve or create Gmail label: ${labelName}`);
  }

  public async archiveEmails(ids: string[]): Promise<{ success: boolean; modifiedIds: string[] }> {
    if (ids.length === 0) return { success: true, modifiedIds: [] };

    await this.retryWithBackoff(() =>
      this.gmail.users.messages.batchModify({
        userId: 'me',
        requestBody: {
          ids,
          removeLabelIds: ['INBOX']
        }
      })
    );

    return { success: true, modifiedIds: ids };
  }

  public async applyLabel(ids: string[], labelName: string): Promise<{ success: boolean; modifiedIds: string[] }> {
    if (ids.length === 0) return { success: true, modifiedIds: [] };
    const labelId = await this.getOrCreateLabelId(labelName);

    await this.retryWithBackoff(() =>
      this.gmail.users.messages.batchModify({
        userId: 'me',
        requestBody: {
          ids,
          addLabelIds: [labelId]
        }
      })
    );

    return { success: true, modifiedIds: ids };
  }

  public async removeLabel(ids: string[], labelName: string): Promise<{ success: boolean; modifiedIds: string[] }> {
    if (ids.length === 0) return { success: true, modifiedIds: [] };
    const labelId = await this.getOrCreateLabelId(labelName);

    await this.retryWithBackoff(() =>
      this.gmail.users.messages.batchModify({
        userId: 'me',
        requestBody: {
          ids,
          removeLabelIds: [labelId]
        }
      })
    );

    return { success: true, modifiedIds: ids };
  }

  public async unarchiveEmails(ids: string[]): Promise<{ success: boolean; modifiedIds: string[] }> {
    if (ids.length === 0) return { success: true, modifiedIds: [] };

    await this.retryWithBackoff(() =>
      this.gmail.users.messages.batchModify({
        userId: 'me',
        requestBody: {
          ids,
          addLabelIds: ['INBOX']
        }
      })
    );

    return { success: true, modifiedIds: ids };
  }
}
