import { Router, Request, Response } from 'express';
import { ActionGuard, ActionGuardError } from '../services/actions/actionGuard';
import { UserStore } from '../services/storage/userStore';
import { ENEMIES } from '../../../shared/constants';
import { EnemyType } from '../../../shared/types';

export const actionRouter = Router();
export const globalActionGuard = new ActionGuard();

// Execute a safe batch action (archive & label) linked to RPG defeat
actionRouter.post('/batch', async (req: Request, res: Response) => {
  try {
    const { emailIds, labelName, enemyType } = req.body;

    if (!Array.isArray(emailIds) || emailIds.length === 0) {
      return res.status(400).json({ error: 'emailIds array is required and must not be empty.' });
    }

    if (!labelName || typeof labelName !== 'string') {
      return res.status(400).json({ error: 'labelName string is required.' });
    }

    // Execute via ActionGuard (will throw 403 if any protected email is in emailIds)
    const result = await globalActionGuard.executeSafeBatchAction(
      req.emailProvider,
      emailIds,
      labelName,
      'archive_and_label'
    );

    // Calculate XP reward based on defeated monsters or items cleaned
    const enemyDef = enemyType ? ENEMIES[enemyType as EnemyType] : undefined;
    const baseReward = enemyDef ? enemyDef.xpReward : 20;
    const totalXp = Math.min(500, Math.max(25, baseReward + Math.floor(result.modifiedCount * 5)));

    // Grant XP and update game stats
    const xpResult = UserStore.addXp(req.userSession.sessionId, totalXp);

    UserStore.updateGameState(req.userSession.sessionId, state => {
      state.clutterDefeated += result.modifiedCount;
      state.kingdomSafetyScore = Math.min(100, state.kingdomSafetyScore + 2);

      // Check active quest progress
      if (state.activeQuest && !state.activeQuest.isCompleted) {
        if (!enemyType || state.activeQuest.targetEnemy === enemyType) {
          state.activeQuest.currentCount += result.modifiedCount;
          if (state.activeQuest.currentCount >= state.activeQuest.targetCount) {
            state.activeQuest.isCompleted = true;
          }
        }
      }
    });

    const updatedSession = UserStore.getOrCreateSession(req.userSession.sessionId);

    res.json({
      success: true,
      modifiedCount: result.modifiedCount,
      undoToken: result.undoToken,
      xpEarned: totalXp,
      levelUp: xpResult.levelUp,
      newLevel: xpResult.newLevel,
      gameState: updatedSession.gameState
    });
  } catch (err: any) {
    if (err instanceof ActionGuardError) {
      return res.status(403).json({
        error: 'Forbidden: Action Blocked by Protection Engine',
        message: err.message,
        protectedEmailIds: err.protectedEmailIds,
        reasons: err.reasons
      });
    }

    console.error('Error in /api/actions/batch:', err);
    res.status(500).json({
      error: 'Failed to execute batch action',
      message: err.message || 'Internal action error'
    });
  }
});

// Reversible Undo endpoint
actionRouter.post('/undo', async (req: Request, res: Response) => {
  try {
    const { undoToken } = req.body;
    if (!undoToken) {
      return res.status(400).json({ error: 'undoToken is required.' });
    }

    const result = await globalActionGuard.executeUndo(req.emailProvider, undoToken);

    UserStore.updateGameState(req.userSession.sessionId, state => {
      state.clutterDefeated = Math.max(0, state.clutterDefeated - result.restoredCount);
    });

    const updatedSession = UserStore.getOrCreateSession(req.userSession.sessionId);

    res.json({
      success: true,
      message: `Action undone. ${result.restoredCount} email(s) restored to previous state.`,
      restoredCount: result.restoredCount,
      gameState: updatedSession.gameState
    });
  } catch (err: any) {
    console.error('Error in /api/actions/undo:', err);
    res.status(400).json({ error: 'Undo failed', message: err.message });
  }
});

// Get recent undo logs
actionRouter.get('/undo-logs', (_req: Request, res: Response) => {
  const logs = globalActionGuard.getRecentUndoLogs();
  res.json({ logs });
});
