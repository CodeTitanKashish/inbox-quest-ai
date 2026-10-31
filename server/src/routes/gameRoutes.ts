import { Router, Request, Response } from 'express';
import { UserStore } from '../services/storage/userStore';

export const gameRouter = Router();

// Get current RPG state
gameRouter.get('/state', (req: Request, res: Response) => {
  const session = req.userSession;
  res.json({
    gameState: session.gameState
  });
});

// Claim completed quest reward
gameRouter.post('/claim-quest', (req: Request, res: Response) => {
  const session = req.userSession;
  const { questId } = req.body;

  if (!session.gameState.activeQuest || session.gameState.activeQuest.id !== questId) {
    return res.status(400).json({ error: 'Quest not active' });
  }

  const quest = session.gameState.activeQuest;
  if (!quest.isCompleted || quest.rewardClaimed) {
    return res.status(400).json({ error: 'Quest is not yet completed or reward already claimed' });
  }

  quest.rewardClaimed = true;
  session.gameState.completedQuests.push(quest.id);

  // Award XP
  const xpResult = UserStore.addXp(session.sessionId, quest.rewardXp);

  res.json({
    success: true,
    message: `Quest complete! Received ${quest.rewardXp} XP!`,
    xpEarned: quest.rewardXp,
    levelUp: xpResult.levelUp,
    newLevel: xpResult.newLevel,
    gameState: session.gameState
  });
});

// Toggle Calm Mode (accessibility setting)
gameRouter.post('/toggle-calm', (req: Request, res: Response) => {
  const session = req.userSession;
  session.gameState.calmMode = !session.gameState.calmMode;
  res.json({
    success: true,
    calmMode: session.gameState.calmMode,
    gameState: session.gameState
  });
});
