import { EmailClassification, EmailItem } from '../../../../shared/types';
import { ProtectionEngine } from '../protection/protectionEngine';

export interface ClassificationResultWithConfidence {
  classification: EmailClassification;
  isCertain: boolean;
}

export class RuleClassifier {
  public static classifyWithConfidence(email: EmailItem): ClassificationResultWithConfidence {
    const text = `${email.subject} ${email.snippet} ${email.sender}`.toLowerCase();
    const sender = (email.senderEmail || email.sender || '').toLowerCase();

    // Check protection first
    const initialProt = ProtectionEngine.evaluate(email);

    if (
      text.includes('lottery') || text.includes('unclaimed inheritance') ||
      text.includes('melt belly fat') || text.includes('free spins') ||
      text.includes('crypto reward') || text.includes('barrister') ||
      text.includes('wire transfer confidential')
    ) {
      return {
        classification: {
          category: 'Spam',
          importanceScore: 5,
          urgencyScore: 10,
          summary: `Suspicious spam solicitation from ${email.sender.split('<')[0].trim()}.`,
          recommendedAction: 'archive',
          reason: 'Contains classic spam keywords, high risk of financial phishing or fraudulent sweepstakes.',
          isProtected: false,
          protectionReasons: []
        },
        isCertain: true
      };
    }

    if (
      text.includes('flash sale') || text.includes('discount') ||
      text.includes('coupon') || text.includes('off your') ||
      text.includes('free shipping') || text.includes('autumn sale') ||
      text.includes('black friday') || text.includes('deal:')
    ) {
      return {
        classification: {
          category: 'Promotion',
          importanceScore: 15,
          urgencyScore: 20,
          summary: `Marketing discount announcement from ${email.sender.split('<')[0].trim()}.`,
          recommendedAction: 'archive',
          reason: 'Time-sensitive commercial promotion or retailer discount code.',
          isProtected: false,
          protectionReasons: []
        },
        isCertain: true
      };
    }

    if (
      text.includes('newsletter') || text.includes('weekly digest') ||
      text.includes('tldr') || text.includes('bytebytego') ||
      text.includes('pragmatic engineer') || text.includes('focus #') ||
      sender.includes('substack') || sender.includes('medium')
    ) {
      return {
        classification: {
          category: 'Newsletter',
          importanceScore: 25,
          urgencyScore: 10,
          summary: `Periodic reading digest or tech newsletter from ${email.sender.split('<')[0].trim()}.`,
          recommendedAction: 'archive',
          reason: 'Informational recurring newsletter suitable for weekend reading or archiving.',
          isProtected: false,
          protectionReasons: []
        },
        isCertain: true
      };
    }

    if (
      sender.includes('linkedin') || sender.includes('twitter') ||
      sender.includes('x.com') || sender.includes('github') ||
      sender.includes('reddit') || sender.includes('duolingo') ||
      text.includes('viewed your profile') || text.includes('notifications')
    ) {
      return {
        classification: {
          category: 'Social',
          importanceScore: 20,
          urgencyScore: 15,
          summary: `Automated social network activity notification from ${email.sender.split('<')[0].trim()}.`,
          recommendedAction: 'archive',
          reason: 'Social media ping or community discussion update.',
          isProtected: false,
          protectionReasons: []
        },
        isCertain: true
      };
    }

    if (
      sender.includes('.edu') || sender.includes('.ac.') ||
      /\bexams?\b/i.test(text) || text.includes('transcript') ||
      text.includes('semester') || text.includes('bursar')
    ) {
      const prot = ProtectionEngine.evaluate(email, 'Education', 85);
      return {
        classification: {
          category: 'Education',
          importanceScore: 90,
          urgencyScore: 80,
          summary: `Official academic record or institutional dispatch from ${email.sender.split('<')[0].trim()}.`,
          recommendedAction: 'keep',
          reason: 'Critical university notice containing academic evaluations, deadlines, or credentials.',
          isProtected: true,
          protectionReasons: prot.reasons
        },
        isCertain: true
      };
    }

    if (
      text.includes('offer letter') || text.includes('internship') ||
      text.includes('interview') || text.includes('placement') ||
      text.includes('assessment link')
    ) {
      const prot = ProtectionEngine.evaluate(email, 'Work', 95);
      return {
        classification: {
          category: 'Work',
          importanceScore: 95,
          urgencyScore: 90,
          summary: `Important employment or career opportunity from ${email.sender.split('<')[0].trim()}.`,
          recommendedAction: 'keep',
          reason: 'High-stakes career correspondence regarding job offer, interview round, or placement drive.',
          isProtected: true,
          protectionReasons: prot.reasons
        },
        isCertain: true
      };
    }

    if (
      text.includes('bank statement') || text.includes('security alert') ||
      text.includes('salary credited') || text.includes('wire transfer') ||
      text.includes('irs') || text.includes('tax return')
    ) {
      const prot = ProtectionEngine.evaluate(email, 'Finance', 95);
      return {
        classification: {
          category: 'Finance',
          importanceScore: 95,
          urgencyScore: 85,
          summary: `Confidential banking, payroll, or tax record from ${email.sender.split('<')[0].trim()}.`,
          recommendedAction: 'keep',
          reason: 'Official financial audit record, fraudulent activity alert, or income documentation.',
          isProtected: true,
          protectionReasons: prot.reasons
        },
        isCertain: true
      };
    }

    if (text.includes('verification code') || text.includes('one-time password') || text.includes('otp')) {
      const prot = ProtectionEngine.evaluate(email, 'Critical', 98);
      return {
        classification: {
          category: 'Critical',
          importanceScore: 98,
          urgencyScore: 98,
          summary: `Security verification OTP code for identity authentication.`,
          recommendedAction: 'keep',
          reason: 'Temporary cryptographic credential required to access accounts.',
          isProtected: true,
          protectionReasons: prot.reasons
        },
        isCertain: true
      };
    }

    // Default evaluation for ambiguous/personal emails
    const isProt = initialProt.isProtected;
    return {
      classification: {
        category: isProt ? 'Important' : 'Personal',
        importanceScore: isProt ? 80 : 40,
        urgencyScore: isProt ? 70 : 30,
        summary: `${email.subject.slice(0, 100)} from ${email.sender.split('<')[0].trim()}.`,
        recommendedAction: isProt ? 'keep' : 'review',
        reason: isProt ? 'Contains protected operational keywords.' : 'General correspondence.',
        isProtected: isProt,
        protectionReasons: initialProt.reasons
      },
      isCertain: isProt // If definitely protected by keywords, certain; otherwise uncertain, candidate for Gemini
    };
  }

  public static classify(email: EmailItem): EmailClassification {
    return this.classifyWithConfidence(email).classification;
  }
}
