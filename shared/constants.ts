import { EnemyDef, EnemyType, RelicType } from './types';

export const ENEMIES: Record<EnemyType, EnemyDef> = {
  SPAM_GOBLIN: {
    type: 'SPAM_GOBLIN',
    name: 'Spam Goblin',
    categoryTarget: 'Spam',
    description: 'Sneaky digital pests peddling fake lotteries and dubious schemes.',
    baseHp: 30,
    xpReward: 25,
    labelToApply: 'InboxQuest/Spam',
    icon: '👺',
    color: '#ef4444'
  },
  PROMOTION_ORC: {
    type: 'PROMOTION_ORC',
    name: 'Promotion Orc',
    categoryTarget: 'Promotion',
    description: 'Brutish merchants shouting relentless flash sales and coupon codes.',
    baseHp: 45,
    xpReward: 35,
    labelToApply: 'InboxQuest/Promotions',
    icon: '👹',
    color: '#f97316'
  },
  NEWSLETTER_SKELETON: {
    type: 'NEWSLETTER_SKELETON',
    name: 'Newsletter Skeleton',
    categoryTarget: 'Newsletter',
    description: 'Undead digests and weekly roundups you swore you would read someday.',
    baseHp: 40,
    xpReward: 30,
    labelToApply: 'InboxQuest/Newsletters',
    icon: '💀',
    color: '#a855f7'
  },
  NOTIFICATION_ZOMBIE: {
    type: 'NOTIFICATION_ZOMBIE',
    name: 'Notification Zombie',
    categoryTarget: 'Social',
    description: 'Mindless social pings and automated alerts demanding your attention.',
    baseHp: 35,
    xpReward: 25,
    labelToApply: 'InboxQuest/Social',
    icon: '🧟',
    color: '#3b82f6'
  },
  DUPLICATE_SLIME: {
    type: 'DUPLICATE_SLIME',
    name: 'Duplicate Slime',
    categoryTarget: 'Personal',
    description: 'Gelatinous clutter multiplying across stale, unresponded threads.',
    baseHp: 25,
    xpReward: 20,
    labelToApply: 'InboxQuest/Duplicates',
    icon: '🫧',
    color: '#06b6d4'
  }
};

export const RELIC_ICONS: Record<RelicType, { icon: string; name: string; color: string; description: string }> = {
  ROYAL_SCROLL: {
    icon: '📜',
    name: 'Royal Scroll',
    color: '#38bdf8',
    description: 'Sacred academic notices, university transcripts, and official institutional dispatches.'
  },
  GOLDEN_RELIC: {
    icon: '👑',
    name: 'Golden Relic',
    color: '#fbbf24',
    description: 'Treasury alerts, bank statements, OTP verification wards, and financial receipts.'
  },
  KNOWLEDGE_CRYSTAL: {
    icon: '💎',
    name: 'Knowledge Crystal',
    color: '#a78bfa',
    description: 'Career offers, interview invitations, internship letters, and official agreements.'
  }
};

export const PROTECTION_KEYWORDS = {
  education: [
    'admissions', 'transcript', 'semester', 'university', 'college', 'dean',
    'registrar', 'faculty', 'exam schedule', 'hall ticket', 'tuition fee',
    'convocation', 'course registration', 'grade card', 'academic calendar'
  ],
  career: [
    'offer letter', 'internship', 'interview', 'job application', 'shortlisted',
    'campus placement', 'recruiter', 'assessment link', 'hiring manager',
    'employment contract', 'onboarding schedule', 'appointment letter'
  ],
  finance: [
    'bank statement', 'transaction alert', 'credit card', 'debit card', 'invoice',
    'receipt', 'tax return', 'wire transfer', 'upi', 'neft', 'salary credited',
    'payment confirmation', 'billing receipt', 'account statement', 'withholding'
  ],
  otpSecurity: [
    'otp', 'verification code', 'one-time password', 'security code', 'password reset',
    'auth code', '2fa', 'authentication code', 'temporary passcode', 'verify your account'
  ],
  officialTravel: [
    'passport', 'visa', 'boarding pass', 'ticket confirmation', 'pnr',
    'flight ticket', 'train booking', 'e-ticket', 'hotel reservation'
  ]
};

export const PROTECTION_DOMAINS = [
  '.edu', '.ac.in', '.ac.uk', '.edu.in', 'university', 'college', 'gov', 'gov.in'
];

export const XP_PER_LEVEL = 100;
export const calculateLevel = (xp: number): { level: number; xpInCurrentLevel: number; xpToNextLevel: number } => {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpInCurrentLevel = xp % XP_PER_LEVEL;
  const xpToNextLevel = XP_PER_LEVEL - xpInCurrentLevel;
  return { level, xpInCurrentLevel, xpToNextLevel };
};

export const DEFAULT_QUESTS = [
  {
    id: 'quest-1',
    title: 'The Goblin Incursion',
    description: 'Banish 5 Spam Goblins to label & archive suspicious scams.',
    targetEnemy: 'SPAM_GOBLIN' as EnemyType,
    targetCount: 5,
    currentCount: 0,
    rewardXp: 150,
    isCompleted: false,
    rewardClaimed: false
  },
  {
    id: 'quest-2',
    title: 'The Orcish Merchants',
    description: 'Defeat 10 Promotion Orcs to archive loud flash sales.',
    targetEnemy: 'PROMOTION_ORC' as EnemyType,
    targetCount: 10,
    currentCount: 0,
    rewardXp: 250,
    isCompleted: false,
    rewardClaimed: false
  },
  {
    id: 'quest-3',
    title: 'Sanctuary of the Relics',
    description: 'Ensure 20 Royal Relics (College notices, Job offers, Bank OTPs) remain untouched.',
    targetEnemy: 'SPAM_GOBLIN' as EnemyType,
    targetCount: 20,
    currentCount: 20,
    rewardXp: 300,
    isCompleted: true,
    rewardClaimed: false
  },
  {
    id: 'quest-4',
    title: 'The Crypt of Subscriptions',
    description: 'Vanquish 8 Newsletter Skeletons and reclaim inbox peace.',
    targetEnemy: 'NEWSLETTER_SKELETON' as EnemyType,
    targetCount: 8,
    currentCount: 0,
    rewardXp: 200,
    isCompleted: false,
    rewardClaimed: false
  }
];

export function createInitialGameState() {
  const { level, xpToNextLevel } = calculateLevel(0);
  return {
    hero: {
      name: 'Paladin of Productivity',
      title: 'Inbox Guardian',
      level,
      xp: 0,
      xpToNextLevel,
      energy: 100,
      maxEnergy: 100,
      attackPower: 25
    },
    kingdomSafetyScore: 85,
    activeQuest: DEFAULT_QUESTS[0],
    completedQuests: [] as string[],
    relicsGuarded: 20,
    clutterDefeated: 0,
    calmMode: false
  };
}

