import { GameState, QuestMission } from '../../../../shared/types';
import { calculateLevel } from '../../../../shared/constants';
import { Redis } from '@upstash/redis';

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

// Initialize Upstash Redis client if credentials exist in environment
let redis: Redis | null = null;
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (redisUrl && redisToken) {
  try {
    redis = new Redis({
      url: redisUrl,
      token: redisToken
    });
    console.log('📡 Upstash Redis initialized for distributed session storage.');
  } catch (err) {
    console.warn('⚠️ Failed to initialize Upstash Redis, falling back to in-memory store:', err);
  }
}

const REDIS_KEY_PREFIX = 'inboxquest:sess:';
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export class UserStore {
  // Local in-memory cache / fallback
  private static sessions: Map<string, UserSessionData> = new Map();

  /**
   * Load session from Upstash Redis into in-memory cache (used in middleware).
   */
  public static async loadSessionAsync(sessionId: string, isDemo = false): Promise<UserSessionData> {
    if (redis) {
      try {
        const remoteData = await redis.get<UserSessionData>(`${REDIS_KEY_PREFIX}${sessionId}`);
        if (remoteData) {
          this.sessions.set(sessionId, remoteData);
          return remoteData;
        }
      } catch (err) {
        console.warn(`Upstash read error for session ${sessionId}:`, err);
      }
    }
    return this.getOrCreateSession(sessionId, isDemo);
  }

  /**
   * Persists session to Upstash Redis if enabled, and updates local cache.
   */
  public static async persistSessionAsync(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || !redis) return;

    try {
      await redis.set(`${REDIS_KEY_PREFIX}${sessionId}`, session, { ex: SESSION_TTL_SECONDS });
    } catch (err) {
      console.warn(`Upstash write error for session ${sessionId}:`, err);
    }
  }

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

  public static async updateTokens(sessionId: string, email: string, tokens: any): Promise<void> {
    const session = this.getOrCreateSession(sessionId, false);
    session.email = email;
    session.tokens = tokens;
    session.isDemo = false;
    await this.persistSessionAsync(sessionId);
  }

  public static updateGameState(sessionId: string, updater: (state: GameState) => void): GameState {
    const session = this.getOrCreateSession(sessionId);
    updater(session.gameState);
    // Non-blocking async sync to Redis
    void this.persistSessionAsync(sessionId);
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

    // Non-blocking async sync to Redis
    void this.persistSessionAsync(sessionId);

    return {
      levelUp: level > oldLevel,
      newLevel: level,
      totalXp: newXp
    };
  }

  public static async clearSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
    if (redis) {
      try {
        await redis.del(`${REDIS_KEY_PREFIX}${sessionId}`);
      } catch (err) {
        console.warn(`Upstash delete error for session ${sessionId}:`, err);
      }
    }
  }
}
