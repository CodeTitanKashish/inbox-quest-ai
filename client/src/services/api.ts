import { ActionLogEntry, DashboardStats, EmailItem, EnemyType, GameState, RelicItem } from '@shared/types';

export interface AuthStatusResponse {
  isAuthenticated: boolean;
  isDemo: boolean;
  email?: string;
}

export interface BatchActionResponse {
  success: boolean;
  modifiedCount: number;
  undoToken: string;
  xpEarned: number;
  levelUp: boolean;
  newLevel: number;
  gameState: GameState;
}

export class ApiService {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(endpoint, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const error: any = new Error(data.message || data.error || `HTTP error ${res.status}`);
      error.status = res.status;
      error.protectedEmailIds = data.protectedEmailIds;
      error.reasons = data.reasons;
      throw error;
    }

    return data as T;
  }

  public static async getAuthStatus(): Promise<AuthStatusResponse> {
    return this.request<AuthStatusResponse>('/api/auth/status');
  }

  public static async getGoogleAuthUrl(): Promise<{ url: string }> {
    return this.request<{ url: string }>('/api/auth/google/url');
  }

  public static async activateDemoMode(): Promise<{ success: boolean; isDemo: boolean }> {
    return this.request<{ success: boolean; isDemo: boolean }>('/api/auth/demo', {
      method: 'POST'
    });
  }

  public static async logout(): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/api/auth/logout', {
      method: 'POST'
    });
  }

  public static async getEmails(options?: { limit?: number; pageToken?: string; search?: string }): Promise<{
    emails: EmailItem[];
    nextPageToken?: string;
    totalCount: number;
  }> {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.pageToken) params.set('pageToken', options.pageToken);
    if (options?.search) params.set('search', options.search);

    return this.request(`/api/emails?${params.toString()}`);
  }

  public static async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/api/emails/dashboard');
  }

  public static async getRelics(): Promise<{ relics: RelicItem[] }> {
    return this.request<{ relics: RelicItem[] }>('/api/emails/relics');
  }

  public static async executeBatchAction(
    emailIds: string[],
    labelName: string,
    enemyType?: EnemyType
  ): Promise<BatchActionResponse> {
    return this.request<BatchActionResponse>('/api/actions/batch', {
      method: 'POST',
      body: JSON.stringify({ emailIds, labelName, enemyType })
    });
  }

  public static async executeUndo(undoToken: string): Promise<{ success: boolean; restoredCount: number; gameState: GameState }> {
    return this.request('/api/actions/undo', {
      method: 'POST',
      body: JSON.stringify({ undoToken })
    });
  }

  public static async getUndoLogs(): Promise<{ logs: ActionLogEntry[] }> {
    return this.request<{ logs: ActionLogEntry[] }>('/api/actions/undo-logs');
  }

  public static async getGameState(): Promise<{ gameState: GameState }> {
    return this.request<{ gameState: GameState }>('/api/game/state');
  }

  public static async claimQuest(questId: string): Promise<{
    success: boolean;
    xpEarned: number;
    levelUp: boolean;
    newLevel: number;
    gameState: GameState;
  }> {
    return this.request('/api/game/claim-quest', {
      method: 'POST',
      body: JSON.stringify({ questId })
    });
  }

  public static async toggleCalmMode(): Promise<{ success: boolean; calmMode: boolean; gameState: GameState }> {
    return this.request('/api/game/toggle-calm', {
      method: 'POST'
    });
  }

  public static async triggerSync(): Promise<{ success: boolean; syncedAt: string; totalCount: number; emails: EmailItem[] }> {
    return this.request('/api/emails/sync', {
      method: 'POST'
    });
  }

  public static createEventSource(): EventSource {
    return new EventSource('/api/emails/live-stream', { withCredentials: true });
  }
}
