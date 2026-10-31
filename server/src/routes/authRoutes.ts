import { Router, Request, Response } from 'express';
import { google } from 'googleapis';
import { UserStore } from '../services/storage/userStore';
import { getOrCreateDemoProvider } from '../middleware/authMiddleware';

export const authRouter = Router();

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify'
];

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8080/api/auth/google/callback'
  );
}

// Check current authentication & mode status
authRouter.get('/status', (req: Request, res: Response) => {
  const session = req.userSession;
  res.json({
    isAuthenticated: Boolean(session && !session.isDemo && session.tokens?.access_token),
    isDemo: Boolean(session?.isDemo),
    email: session?.email || (session?.isDemo ? 'demo.paladin@inboxquest.io' : undefined)
  });
});

// Generate Google OAuth URL (gmail.modify only)
authRouter.get('/google/url', (_req: Request, res: Response) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      error: 'Google OAuth is not configured on this server. Please use Demo Mode or set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET.'
    });
  }

  const oauth2Client = getOAuth2Client();
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });

  res.json({ url: authUrl });
});

// OAuth Callback handler
authRouter.get('/google/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string;
  if (!code) {
    return res.redirect('/?error=oauth_missing_code');
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get basic profile to identify email
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const userEmail = profile.data.emailAddress || 'user@gmail.com';

    // Store tokens strictly server-side
    UserStore.updateTokens(req.userSession.sessionId, userEmail, tokens);

    res.cookie('inbox_quest_authenticated', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.cookie('inbox_quest_demo', 'false', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    const clientUrl = process.env.CLIENT_URL || '/';
    res.redirect(clientUrl);
  } catch (error: any) {
    console.error('OAuth Callback Error:', error);
    res.redirect(`/?error=${encodeURIComponent(error.message || 'oauth_failed')}`);
  }
});

// Activate Demo Mode (loads ~200 sample emails, no login required)
authRouter.post('/demo', (req: Request, res: Response) => {
  req.userSession.isDemo = true;
  getOrCreateDemoProvider(req.userSession.sessionId).reset();

  res.cookie('inbox_quest_demo', 'true', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  res.clearCookie('inbox_quest_authenticated');

  res.json({
    success: true,
    message: 'Demo Mode active. 200 sample emails loaded.',
    isDemo: true
  });
});

// Logout / Reset
authRouter.post('/logout', (req: Request, res: Response) => {
  UserStore.clearSession(req.userSession.sessionId);
  res.clearCookie('inbox_quest_authenticated');
  res.cookie('inbox_quest_demo', 'true', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  res.json({ success: true });
});
