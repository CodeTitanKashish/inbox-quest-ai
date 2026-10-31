import { Request, Response, NextFunction } from 'express';
import { google } from 'googleapis';
import { UserStore, UserSessionData } from '../services/storage/userStore';
import { IEmailProvider } from '../services/providers/emailProvider';
import { DemoProvider } from '../services/providers/demoProvider';
import { GmailProvider } from '../services/providers/gmailProvider';

declare global {
  namespace Express {
    interface Request {
      userSession: UserSessionData;
      emailProvider: IEmailProvider;
    }
  }
}

// Single singleton demo provider per app (or per session)
const demoProviders = new Map<string, DemoProvider>();

export function getOrCreateDemoProvider(sessionId: string): DemoProvider {
  if (!demoProviders.has(sessionId)) {
    demoProviders.set(sessionId, new DemoProvider());
  }
  return demoProviders.get(sessionId)!;
}

export function sessionMiddleware(req: Request, res: Response, next: NextFunction): void {
  let sessionId = req.cookies?.inbox_quest_session;

  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    res.cookie('inbox_quest_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  }

  const isDemo = req.cookies?.inbox_quest_demo === 'true' || !req.cookies?.inbox_quest_authenticated;
  const session = UserStore.getOrCreateSession(sessionId, isDemo);

  req.userSession = session;

  // Configure appropriate provider: Gmail or Demo
  if (!session.isDemo && session.tokens?.access_token) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    oauth2Client.setCredentials(session.tokens);
    req.emailProvider = new GmailProvider(oauth2Client);
  } else {
    req.emailProvider = getOrCreateDemoProvider(sessionId);
  }

  next();
}
