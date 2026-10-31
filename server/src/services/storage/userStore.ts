import { GameState, QuestMission } from '../../../../shared/types';
import { calculateLevel } from '../../../../shared/constants';

export interface UserSessionData {
  sessionId: string;
  isDemo: boolean;
  email?: string;
  tokens?: {
    access_token?: string | null;
    refresh_token?: string | null;
    expiry_date?: number | null;
  };
  gameState: GameState;
}

const DEFAULT_QUESTS: QuestMission[] = [
  {
    id: 'quest-1',
    title: 'The Goblin Incursion',
    description: 'Banish 5 Spam Goblins to label & archive suspicious scams.',
    targetEnemy: 'SPAM_GOBLIN',
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
    targetEnemy: 'PROMOTION_ORC',
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
    targetEnemy: 'SPAM_GOBLIN', // Guard mission
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
    targetEnemy: 'NEWSLETTER_SKELETON',
    targetCount: 8,
    currentCount: 0,
    rewardXp: 200,
    isCompleted: false,
    rewardClaimed: false
  }
];

export function createInitialGameState(): GameState {
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
    completedQuests: [],
    relicsGuarded: 20,
    clutterDefeated: 0,
    calmMode: false
  };
}

export class UserStore {
  private static sessions: Map<string, UserSessionData> = new Map();

  public static getOrCreateSession(sessionId: string, isDemo = false): UserSessionData {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        sessionId,
        isDemo,
        gameState: createInitialGameState()
      });
    }
    return this.sessions.get(sessionId)!;
  }

  public static updateTokens(sessionId: string, email: string, tokens: any): void {
    const session = this.getOrCreateSession(sessionId, false);
    session.email = email;
    session.tokens = tokens;
    session.isDemo = false;
  }

  public static updateGameState(sessionId: string, updater: (state: GameState) => void): GameState {
    const session = this.getOrCreateSession(sessionId);
    updater(session.gameState);
    return session.gameState;
  }

  public static addXp(sessionId: string, amount: number): { levelUp: boolean; newLevel: number; totalXp: number } {
    const session = this.getOrCreateSession(sessionId);
    const oldLevel = session.gameState.hero.level;
    const newXp = session.gameState.hero.xp + amount;
    const { level, xpToNextLevel } = calculateLevel(newXp);

    session.gameState.hero.xp = newXp;
    session.gameState.hero.level = level;
    session.gameState.hero.xpToNextLevel = xpToNextLevel;

    // Boost attack power slightly on level up
    if (level > oldLevel) {
      session.gameState.hero.attackPower = 25 + (level - 1) * 5;
    }

    return {
      levelUp: level > oldLevel,
      newLevel: level,
      totalXp: newXp
    };
  }

  public static clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}
