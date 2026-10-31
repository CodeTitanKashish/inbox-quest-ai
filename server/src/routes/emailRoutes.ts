import { Router, Request, Response } from 'express';
import { GeminiClassifier } from '../services/ai/geminiClassifier';
import { ProtectionEngine } from '../services/protection/protectionEngine';
import { DashboardStats, RelicItem } from '../../../shared/types';
import { RELIC_ICONS } from '../../../shared/constants';

export const emailRouter = Router();

// In-memory sync status tracking per session
interface SyncStatus {
  isSyncing: boolean;
  loadedCount: number;
  totalCount: number;
  percent: number;
}
const sessionSyncStatus = new Map<string, SyncStatus>();

// List emails with AI classification and protection status
// Loads first ~100 emails right away for instant gameplay, streams the rest in the background
emailRouter.get('/', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const pageToken = req.query.pageToken as string | undefined;
    const search = req.query.search as string | undefined;
    const sessionId = req.userSession.sessionId;

    const listResult = await req.emailProvider.listEmails({ limit, pageToken, search });

    // Classify immediate batch (uses Rules-First + LRU cache + Gemini fallback)
    const classifications = await GeminiClassifier.classifyBatch(listResult.emails);

    const enrichedEmails = listResult.emails.map(email => ({
      ...email,
      classification: classifications.get(email.id)
    }));

    // Initialize or update sync status
    const currentLoaded = enrichedEmails.length;
    const total = listResult.totalCount || currentLoaded;
    const isComplete = currentLoaded >= total;

    sessionSyncStatus.set(sessionId, {
      isSyncing: !isComplete,
      loadedCount: currentLoaded,
      totalCount: total,
      percent: Math.min(100, Math.round((currentLoaded / total) * 100))
    });

    // Trigger non-blocking background hydration for any remaining emails if not fully loaded
    if (!isComplete && !pageToken && !search) {
      setImmediate(async () => {
        try {
          const remainingResult = await req.emailProvider.listEmails({ limit: total - currentLoaded, pageToken: String(currentLoaded) });
          await GeminiClassifier.classifyBatch(remainingResult.emails);
          sessionSyncStatus.set(sessionId, {
            isSyncing: false,
            loadedCount: total,
            totalCount: total,
            percent: 100
          });
        } catch (bgErr) {
          console.warn('Background email hydration completed with partial results:', bgErr);
          sessionSyncStatus.set(sessionId, {
            isSyncing: false,
            loadedCount: currentLoaded,
            totalCount: total,
            percent: 100
          });
        }
      });
    }

    res.json({
      emails: enrichedEmails,
      nextPageToken: listResult.nextPageToken,
      totalCount: listResult.totalCount,
      syncStatus: sessionSyncStatus.get(sessionId)
    });
  } catch (err: any) {
    console.error('Error in /api/emails:', err);
    res.status(500).json({
      error: 'Failed to retrieve emails',
      message: err.message || 'Unknown provider error'
    });
  }
});

// Background Sync Status endpoint for UI progress indicator
emailRouter.get('/sync-status', (req: Request, res: Response) => {
  const status = sessionSyncStatus.get(req.userSession.sessionId) || {
    isSyncing: false,
    loadedCount: 100,
    totalCount: 100,
    percent: 100
  };
  res.json(status);
});

// Dashboard statistics and dynamic AI insight line
emailRouter.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const listResult = await req.emailProvider.listEmails({ limit: 200 });
    const classifications = await GeminiClassifier.classifyBatch(listResult.emails);

    let unreadCount = 0;
    let protectedCount = 0;
    let spamCount = 0;
    let promoCount = 0;
    let newsCount = 0;
    let importantCount = 0;
    let urgentCount = 0;

    for (const email of listResult.emails) {
      if (email.isUnread) unreadCount++;

      const c = classifications.get(email.id);
      if (c) {
        if (c.isProtected) protectedCount++;
        if (c.category === 'Spam') spamCount++;
        if (c.category === 'Promotion') promoCount++;
        if (c.category === 'Newsletter') newsCount++;
        if (c.category === 'Important' || c.category === 'Critical' || c.importanceScore >= 70) importantCount++;
        if (c.urgencyScore >= 70) urgentCount++;
      }
    }

    const aiInsight = `You have ${listResult.totalCount} emails. ${protectedCount} sacred relics & notices are ironclad-protected. ${spamCount} spam threats and ${promoCount} promotional orcs can be safely vanquished with zero risk to critical mail.`;

    const stats: DashboardStats = {
      totalEmails: listResult.totalCount,
      unreadCount,
      protectedCount,
      spamCandidatesCount: spamCount,
      promotionsCount: promoCount,
      newslettersCount: newsCount,
      importantCount,
      urgentCount,
      aiInsight
    };

    res.json(stats);
  } catch (err: any) {
    console.error('Error in /api/emails/dashboard:', err);
    res.status(500).json({ error: 'Failed to generate dashboard overview', message: err.message });
  }
});

// Get guarded Royal Relics & Critical items
emailRouter.get('/relics', async (req: Request, res: Response) => {
  try {
    const listResult = await req.emailProvider.listEmails({ limit: 200 });
    const classifications = await GeminiClassifier.classifyBatch(listResult.emails);

    const relics: RelicItem[] = [];
    for (const email of listResult.emails) {
      const c = classifications.get(email.id);
      if (c && c.isProtected) {
        const evalRes = ProtectionEngine.evaluate(email, c.category, c.importanceScore);
        const relicType = evalRes.relicType || 'ROYAL_SCROLL';
        const meta = RELIC_ICONS[relicType];

        relics.push({
          id: `relic-${email.id}`,
          type: relicType,
          title: email.subject,
          reason: c.protectionReasons.join('; ') || 'Critical Royal Asset',
          sender: email.sender,
          emailId: email.id,
          icon: meta.icon,
          color: meta.color
        });
      }
    }

    res.json({ relics });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch relics', message: err.message });
  }
});
