import { EmailCategory, EmailItem, RelicType } from '../../../../shared/types';
import { PROTECTION_DOMAINS, PROTECTION_KEYWORDS } from '../../../../shared/constants';

export interface ProtectionEvaluation {
  isProtected: boolean;
  reasons: string[];
  relicType?: RelicType;
}

export class ProtectionEngine {
  /**
   * Evaluates if an email MUST be protected.
   * Enforced strictly on backend: keyword/sender matching OR AI category OR high importance.
   * If any match, or if uncertain, protects by default.
   */
  public static evaluate(
    email: EmailItem,
    aiCategory?: EmailCategory,
    aiImportanceScore?: number
  ): ProtectionEvaluation {
    const reasons: string[] = [];
    const textToScan = `${email.subject} ${email.snippet} ${email.sender} ${email.senderEmail}`.toLowerCase();
    const senderEmail = (email.senderEmail || email.sender || '').toLowerCase();

    const matchesKeyword = (text: string, kw: string): boolean => {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      return regex.test(text);
    };

    // 1. Education & Academic checks
    const hasEduDomain = PROTECTION_DOMAINS.some(d => senderEmail.endsWith(d) || senderEmail.includes(d));
    const eduMatches = PROTECTION_KEYWORDS.education.filter(kw => matchesKeyword(textToScan, kw));
    if (hasEduDomain || eduMatches.length > 0) {
      reasons.push(
        hasEduDomain
          ? `Official institution domain (${senderEmail})`
          : `Academic/College communication (${eduMatches.slice(0, 2).join(', ')})`
      );
    }

    // 2. Career, Placement & Job Offers
    const careerMatches = PROTECTION_KEYWORDS.career.filter(kw => matchesKeyword(textToScan, kw));
    if (careerMatches.length > 0) {
      reasons.push(`Career / Placement / Job offer communication (${careerMatches.slice(0, 2).join(', ')})`);
    }

    // 3. Banking & Financial Security
    const finMatches = PROTECTION_KEYWORDS.finance.filter(kw => matchesKeyword(textToScan, kw));
    if (finMatches.length > 0) {
      reasons.push(`Banking / Financial security record (${finMatches.slice(0, 2).join(', ')})`);
    }

    // 4. OTP & 2FA Codes
    const otpMatches = PROTECTION_KEYWORDS.otpSecurity.filter(kw => matchesKeyword(textToScan, kw));
    if (otpMatches.length > 0) {
      reasons.push(`Security OTP / 2FA verification code (${otpMatches.slice(0, 2).join(', ')})`);
    }

    // 5. Official Travel & Government
    const travelMatches = PROTECTION_KEYWORDS.officialTravel.filter(kw => matchesKeyword(textToScan, kw));
    if (travelMatches.length > 0) {
      reasons.push(`Official travel / Government document (${travelMatches.slice(0, 2).join(', ')})`);
    }


    // 6. AI Category Integration
    if (aiCategory) {
      const protectedCategories: EmailCategory[] = ['Critical', 'Important', 'Education', 'Work', 'Finance'];
      if (protectedCategories.includes(aiCategory)) {
        reasons.push(`AI categorized as critical domain: ${aiCategory}`);
      }
    }

    // 7. Importance Score threshold
    if (typeof aiImportanceScore === 'number' && aiImportanceScore >= 75) {
      reasons.push(`High AI importance priority score (${aiImportanceScore}/100)`);
    }

    const isProtected = reasons.length > 0;

    let relicType: RelicType | undefined = undefined;
    if (isProtected) {
      // Determine fantasy RPG relic aesthetic
      if (reasons.some(r => r.includes('Academic') || r.includes('institution') || r.includes('travel'))) {
        relicType = 'ROYAL_SCROLL';
      } else if (reasons.some(r => r.includes('Banking') || r.includes('Financial') || r.includes('OTP'))) {
        relicType = 'GOLDEN_RELIC';
      } else {
        relicType = 'KNOWLEDGE_CRYSTAL';
      }
    }

    return {
      isProtected,
      reasons,
      relicType
    };
  }
}
