import { GoogleGenAI } from '@google/genai';
import { EmailClassification, EmailItem } from '../../../../shared/types';
import { validateClassificationOutput } from '../../../../shared/schemas';
import { ProtectionEngine } from '../protection/protectionEngine';
import { RuleClassifier } from './ruleClassifier';

// High-performance LRU cache bounded to 5,000 entries
class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;

  constructor(capacity = 5000) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const val = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export class GeminiClassifier {
  private static lruCache = new LRUCache<string, EmailClassification>(5000);
  private static aiClient: GoogleGenAI | null = null;

  private static getClient(): GoogleGenAI | null {
    if (this.aiClient) return this.aiClient;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return null;
    }
    try {
      this.aiClient = new GoogleGenAI({ apiKey });
      return this.aiClient;
    } catch (e) {
      console.warn('Failed to initialize GoogleGenAI client, using RuleClassifier:', e);
      return null;
    }
  }

  /**
   * Helper to execute async operations with exponential backoff on 429/5xx.
   */
  private static async retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, initialDelayMs = 500): Promise<T> {
    let delay = initialDelayMs;
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await fn();
      } catch (err: any) {
        const isRateLimit = err?.status === 429 || err?.code === 429 || /rate limit|quota/i.test(err?.message || '');
        const isServerError = err?.status >= 500 || err?.code >= 500;
        if ((isRateLimit || isServerError) && attempt < retries - 1) {
          console.warn(`Gemini API call failed with ${err?.status || err?.code || 'error'}. Retrying in ${delay}ms... (attempt ${attempt + 1}/${retries})`);
          await new Promise(res => setTimeout(res, delay));
          delay *= 2;
        } else {
          throw err;
        }
      }
    }
    throw new Error('Gemini API retries exhausted');
  }

  /**
   * Classifies a batch of emails.
   * 1. Check LRU Cache.
   * 2. Run deterministic RuleClassifier FIRST. If certain, classify immediately.
   * 3. Only send uncertain emails to Gemini in batches of 30-50.
   * 4. Run parallel Gemini batches with concurrency limit.
   */
  public static async classifyBatch(emails: EmailItem[]): Promise<Map<string, EmailClassification>> {
    const results = new Map<string, EmailClassification>();
    const uncertainForGemini: EmailItem[] = [];

    // Step 1 & 2: Cache & Rules-First
    for (const email of emails) {
      const cached = this.lruCache.get(email.id);
      if (cached) {
        results.set(email.id, cached);
        continue;
      }

      // Run rule-based classifier first to save quota & time
      const { classification: ruleResult, isCertain } = RuleClassifier.classifyWithConfidence(email);
      if (isCertain) {
        this.lruCache.set(email.id, ruleResult);
        results.set(email.id, ruleResult);
      } else {
        uncertainForGemini.push(email);
      }
    }

    if (uncertainForGemini.length === 0) {
      return results;
    }

    const client = this.getClient();
    if (!client) {
      // Fallback directly to rule result for uncertain items if client is not configured
      for (const email of uncertainForGemini) {
        const fallback = RuleClassifier.classify(email);
        this.lruCache.set(email.id, fallback);
        results.set(email.id, fallback);
      }
      return results;
    }

    // Step 3: Batch up to 35 emails per Gemini call
    const BATCH_SIZE = 35;
    const batches: EmailItem[][] = [];
    for (let i = 0; i < uncertainForGemini.length; i += BATCH_SIZE) {
      batches.push(uncertainForGemini.slice(i, i + BATCH_SIZE));
    }

    // Step 4: Run batches in parallel with a concurrency limit of 3
    const CONCURRENCY_LIMIT = 3;
    for (let i = 0; i < batches.length; i += CONCURRENCY_LIMIT) {
      const chunk = batches.slice(i, i + CONCURRENCY_LIMIT);
      await Promise.all(
        chunk.map(batch => this.processSingleGeminiBatch(client, batch, results))
      );
    }

    return results;
  }

  private static async processSingleGeminiBatch(
    client: GoogleGenAI,
    batch: EmailItem[],
    results: Map<string, EmailClassification>
  ): Promise<void> {
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    // Strictly send only id, sender, subject, and snippet for privacy & token efficiency
    const payload = batch.map(e => ({
      id: e.id,
      sender: e.sender,
      subject: e.subject,
      snippet: e.snippet
    }));

    const prompt = `You are the AI Intelligence Engine for Inbox Quest.
Analyze and classify this batch of ${payload.length} emails.
Categories MUST be one of: "Critical", "Important", "Education", "Work", "Finance", "Personal", "Newsletter", "Promotion", "Social", "Spam".
RecommendedAction MUST be one of: "keep", "archive", "label", "review".
Score importance (0-100) and urgency (0-100).
Provide 1 sentence crisp summary.
Mark isProtected: true if related to college, placements, internships, job offers, banking, bills, OTPs, or travel documents.

Return a JSON array of objects:
[
  {
    "id": "email_id",
    "category": "Education",
    "importanceScore": 85,
    "urgencyScore": 70,
    "summary": "...",
    "recommendedAction": "keep",
    "reason": "...",
    "isProtected": true,
    "protectionReasons": ["University notice"]
  }
]

Emails:
${JSON.stringify(payload, null, 2)}`;

    try {
      const response = await this.retryWithBackoff(async () =>
        client.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        })
      );

      const responseText = response.text?.trim() || '[]';
      let parsed: any[] = [];
      try {
        parsed = JSON.parse(responseText);
      } catch {
        console.warn('Gemini response JSON parse failed, falling back to rule classifier.');
      }

      const parsedMap = new Map<string, any>();
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          const validated = validateClassificationOutput(item);
          if (validated) parsedMap.set(validated.id, validated);
        }
      }

      for (const email of batch) {
        let classification: EmailClassification;
        const aiOutput = parsedMap.get(email.id);

        if (aiOutput) {
          const protEval = ProtectionEngine.evaluate(email, aiOutput.category, aiOutput.importanceScore);
          const isProtected = protEval.isProtected || aiOutput.isProtected;
          const combinedReasons = Array.from(new Set([...protEval.reasons, ...(aiOutput.protectionReasons || [])]));

          classification = {
            category: aiOutput.category,
            importanceScore: aiOutput.importanceScore,
            urgencyScore: aiOutput.urgencyScore,
            summary: aiOutput.summary,
            recommendedAction: isProtected ? 'keep' : aiOutput.recommendedAction,
            reason: aiOutput.reason,
            isProtected,
            protectionReasons: combinedReasons
          };
        } else {
          classification = RuleClassifier.classify(email);
        }

        this.lruCache.set(email.id, classification);
        results.set(email.id, classification);
      }
    } catch (err) {
      console.warn('Gemini batch failed after retries, applying rule classifier fallback:', err);
      for (const email of batch) {
        const classified = RuleClassifier.classify(email);
        this.lruCache.set(email.id, classified);
        results.set(email.id, classified);
      }
    }
  }

  public static getCached(id: string): EmailClassification | undefined {
    return this.lruCache.get(id);
  }

  public static clearCache(): void {
    this.lruCache.clear();
  }
}
