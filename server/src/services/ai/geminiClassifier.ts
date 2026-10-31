import { GoogleGenAI } from '@google/genai';
import { EmailClassification, EmailItem } from '../../../../shared/types';
import { validateClassificationOutput } from '../../../../shared/schemas';
import { ProtectionEngine } from '../protection/protectionEngine';
import { RuleClassifier } from './ruleClassifier';

export class GeminiClassifier {
  private static cache: Map<string, EmailClassification> = new Map();
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
      console.warn('Failed to initialize GoogleGenAI client, falling back to RuleClassifier:', e);
      return null;
    }
  }

  /**
   * Classify a batch of emails.
   * Only sends sender, subject, and snippet (never full email bodies).
   */
  public static async classifyBatch(emails: EmailItem[]): Promise<Map<string, EmailClassification>> {
    const results = new Map<string, EmailClassification>();
    const unclassified: EmailItem[] = [];

    // Check cache first
    for (const email of emails) {
      if (this.cache.has(email.id)) {
        results.set(email.id, this.cache.get(email.id)!);
      } else {
        unclassified.push(email);
      }
    }

    if (unclassified.length === 0) {
      return results;
    }

    const client = this.getClient();
    if (!client) {
      // Fallback directly to rule classifier
      for (const email of unclassified) {
        const classified = RuleClassifier.classify(email);
        this.cache.set(email.id, classified);
        results.set(email.id, classified);
      }
      return results;
    }

    // Process in batches of 15 emails to stay well within token limits and latency targets
    const batchSize = 15;
    for (let i = 0; i < unclassified.length; i += batchSize) {
      const batch = unclassified.slice(i, i + batchSize);
      await this.processBatchWithGemini(client, batch, results);
    }

    return results;
  }

  private static async processBatchWithGemini(
    client: GoogleGenAI,
    batch: EmailItem[],
    results: Map<string, EmailClassification>
  ): Promise<void> {
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    // Build privacy-first sanitized metadata payload
    const payload = batch.map(e => ({
      id: e.id,
      sender: e.sender,
      subject: e.subject,
      snippet: e.snippet
    }));

    const prompt = `You are the AI Intelligence Engine for Inbox Quest.
Analyze the following batch of emails and classify each one.
Categories MUST be one of: "Critical", "Important", "Education", "Work", "Finance", "Personal", "Newsletter", "Promotion", "Social", "Spam".
RecommendedAction MUST be one of: "keep", "archive", "label", "review".
Score importance (0-100) and urgency (0-100).
Provide a 1-sentence crisp summary.
Mark isProtected: true if the email is related to college/university, internships, job offers, banking, bills, OTPs, or government/travel notices.

Return a JSON array of objects conforming to:
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
    "protectionReasons": ["University exam notice"]
  }
]

Emails to classify:
${JSON.stringify(payload, null, 2)}`;

    try {
      const response = await client.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text?.trim() || '[]';
      let parsed: any[] = [];
      try {
        parsed = JSON.parse(responseText);
      } catch {
        console.warn('Gemini response was not valid JSON, falling back to rule classifier for this batch.');
      }

      const parsedMap = new Map<string, any>();
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          const validated = validateClassificationOutput(item);
          if (validated) {
            parsedMap.set(validated.id, validated);
          }
        }
      }

      for (const email of batch) {
        let classification: EmailClassification;
        const aiOutput = parsedMap.get(email.id);

        if (aiOutput) {
          // Merge with backend rule protection engine (rules ALWAYS have final say for safety)
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
          // Fallback to rule classifier for any missing item
          classification = RuleClassifier.classify(email);
        }

        this.cache.set(email.id, classification);
        results.set(email.id, classification);
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to RuleClassifier:', err);
      for (const email of batch) {
        const classified = RuleClassifier.classify(email);
        this.cache.set(email.id, classified);
        results.set(email.id, classified);
      }
    }
  }

  public static getCached(id: string): EmailClassification | undefined {
    return this.cache.get(id);
  }

  public static clearCache(): void {
    this.cache.clear();
  }
}
