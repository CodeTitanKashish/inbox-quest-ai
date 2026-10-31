import { Response } from 'express';
import { IEmailProvider } from '../providers/emailProvider';

export interface RealtimeEvent {
  type: 'connected' | 'inbox_changed' | 'action_executed' | 'heartbeat' | 'sync';
  timestamp: string;
  data?: any;
}

interface ClientConnection {
  res: Response;
  provider: IEmailProvider;
  lastHistoryId?: string;
  connectedAt: Date;
}

export class RealtimeHub {
  private static instance: RealtimeHub;
  private connections: Map<string, Set<ClientConnection>> = new Map(); // sessionId -> Set of connections
  private checkInterval: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startBackgroundLoops();
  }

  public static getInstance(): RealtimeHub {
    if (!RealtimeHub.instance) {
      RealtimeHub.instance = new RealtimeHub();
    }
    return RealtimeHub.instance;
  }

  /**
   * Registers a client for Server-Sent Events (SSE).
   */
  public async registerClient(sessionId: string, res: Response, provider: IEmailProvider): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    let initialHistoryId: string | undefined;
    if (provider.getHistoryId) {
      initialHistoryId = await provider.getHistoryId();
    }

    const connection: ClientConnection = {
      res,
      provider,
      lastHistoryId: initialHistoryId,
      connectedAt: new Date()
    };

    if (!this.connections.has(sessionId)) {
      this.connections.set(sessionId, new Set());
    }
    this.connections.get(sessionId)!.add(connection);

    // Send initial connected payload
    this.sendEventToConnection(connection, {
      type: 'connected',
      timestamp: new Date().toISOString(),
      data: {
        sessionId,
        historyId: initialHistoryId,
        message: 'Real-time Gmail inbox connection established.'
      }
    });

    res.on('close', () => {
      const set = this.connections.get(sessionId);
      if (set) {
        set.delete(connection);
        if (set.size === 0) {
          this.connections.delete(sessionId);
        }
      }
    });
  }

  /**
   * Broadcasts an event to all connected clients for a given session.
   */
  public broadcastToSession(sessionId: string, event: RealtimeEvent): void {
    const clients = this.connections.get(sessionId);
    if (!clients || clients.size === 0) return;

    for (const client of clients) {
      this.sendEventToConnection(client, event);
    }
  }

  /**
   * Broadcasts an event to all connected clients across all sessions (e.g. Pub/Sub push).
   */
  public broadcastToAll(event: RealtimeEvent): void {
    for (const clients of this.connections.values()) {
      for (const client of clients) {
        this.sendEventToConnection(client, event);
      }
    }
  }

  /**
   * Notifies clients that an action (batch modify, undo) was executed.
   */
  public notifyActionExecuted(sessionId: string, payload: {
    actionType: string;
    modifiedCount: number;
    labelName?: string;
    undoToken?: string;
  }): void {
    // Also bump provider history if demo
    const clients = this.connections.get(sessionId);
    if (clients) {
      for (const client of clients) {
        if (typeof (client.provider as any).bumpVersion === 'function') {
          (client.provider as any).bumpVersion();
        }
      }
    }

    this.broadcastToSession(sessionId, {
      type: 'action_executed',
      timestamp: new Date().toISOString(),
      data: payload
    });
  }

  /**
   * Formats and writes an SSE event string to the client response stream.
   */
  private sendEventToConnection(connection: ClientConnection, event: RealtimeEvent): void {
    try {
      connection.res.write(`event: ${event.type}\n`);
      connection.res.write(`data: ${JSON.stringify(event)}\n\n`);
    } catch (err) {
      console.warn('Failed to write SSE event to connection:', err);
    }
  }

  /**
   * Starts periodic checks for inbox changes and heartbeat pings.
   */
  private startBackgroundLoops(): void {
    // 1. Heartbeat every 15s to keep connections open
    this.heartbeatInterval = setInterval(() => {
      for (const clients of this.connections.values()) {
        for (const client of clients) {
          try {
            client.res.write(': keep-alive ping\n\n');
          } catch {
            // connection will be cleaned up on close
          }
        }
      }
    }, 15000);

    // 2. Poll for Gmail history changes every 10s for connected sessions
    this.checkInterval = setInterval(async () => {
      for (const [sessionId, clients] of this.connections.entries()) {
        for (const client of clients) {
          if (!client.provider.checkChanges) continue;

          try {
            const check = await client.provider.checkChanges(client.lastHistoryId || '');
            if (check.hasChanges) {
              client.lastHistoryId = check.newHistoryId;
              this.sendEventToConnection(client, {
                type: 'inbox_changed',
                timestamp: new Date().toISOString(),
                data: {
                  historyId: check.newHistoryId,
                  reason: 'Incoming or modified email detected in Gmail inbox'
                }
              });
            }
          } catch (err) {
            console.warn(`Error checking Gmail changes for session ${sessionId}:`, err);
          }
        }
      }
    }, 10000);
  }

  public destroy(): void {
    if (this.checkInterval) clearInterval(this.checkInterval);
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.connections.clear();
  }
}

