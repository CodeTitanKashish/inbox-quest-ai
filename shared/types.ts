export type EmailCategory =
  | 'Critical'
  | 'Important'
  | 'Education'
  | 'Work'
  | 'Finance'
  | 'Personal'
  | 'Newsletter'
  | 'Promotion'
  | 'Social'
  | 'Spam';

export type RecommendedAction = 'keep' | 'archive' | 'label' | 'review';

export interface EmailClassification {
  category: EmailCategory;
  importanceScore: number; // 0 - 100
  urgencyScore: number;    // 0 - 100
  summary: string;         // 1 crisp sentence
  recommendedAction: RecommendedAction;
  reason: string;
  isProtected: boolean;
  protectionReasons: string[];
}

export interface EmailItem {
  id: string;
  threadId: string;
  sender: string;
  senderEmail: string;
  recipient: string;
  subject: string;
  snippet: string;
  date: string;
  labels: string[];
  isUnread: boolean;
  classification?: EmailClassification;
}

export type EnemyType =
  | 'SPAM_GOBLIN'
  | 'PROMOTION_ORC'
  | 'NEWSLETTER_SKELETON'
  | 'NOTIFICATION_ZOMBIE'
  | 'DUPLICATE_SLIME';

export interface EnemyDef {
  type: EnemyType;
  name: string;
  categoryTarget: EmailCategory;
  description: string;
  baseHp: number;
  xpReward: number;
  labelToApply: string;
  icon: string;
  color: string;
}

export type RelicType = 'ROYAL_SCROLL' | 'GOLDEN_RELIC' | 'KNOWLEDGE_CRYSTAL';

export interface RelicItem {
  id: string;
  type: RelicType;
  title: string;
  reason: string;
  sender: string;
  emailId: string;
  icon: string;
  color: string;
}

export interface HeroStats {
  name: string;
  title: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  energy: number;
  maxEnergy: number;
  attackPower: number;
}

export interface QuestMission {
  id: string;
  title: string;
  description: string;
  targetEnemy: EnemyType;
  targetCount: number;
  currentCount: number;
  rewardXp: number;
  isCompleted: boolean;
  rewardClaimed: boolean;
}

export interface GameState {
  hero: HeroStats;
  kingdomSafetyScore: number; // 0 - 100%
  activeQuest: QuestMission | null;
  completedQuests: string[];
  relicsGuarded: number;
  clutterDefeated: number;
  calmMode: boolean;
}

export interface ActionBatchRequest {
  actionType: 'archive_and_label';
  emailIds: string[];
  labelName: string;
  enemyType?: EnemyType;
}

export interface ActionLogEntry {
  id: string;
  timestamp: string;
  actionType: string;
  affectedEmailIds: string[];
  labelName: string;
  undoable: boolean;
  previousStates: Array<{
    emailId: string;
    labels: string[];
  }>;
}

export interface DashboardStats {
  totalEmails: number;
  unreadCount: number;
  protectedCount: number;
  spamCandidatesCount: number;
  promotionsCount: number;
  newslettersCount: number;
  importantCount: number;
  urgentCount: number;
  aiInsight: string;
}
