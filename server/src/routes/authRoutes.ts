import { Router, Request, Response } from 'express';
import { google } from 'googleapis';
import { UserStore } from '../services/storage/userStore';
import { getOrCreateDemoProvider } from '../middleware/authMiddleware';

export const authRouter = Router();

// Requested minimal scope: gmail.modify only
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify'
];

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Google OAuth credentials not fully configured in environment variables.');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

function getClientRedirectUrl(): string {
  // Normalize client target URL for browser redirect after OAuth
  const clientUrl = process.env.CLIENT_URL || 'https://inbox-quest-ai-six.vercel.app';
  return clientUrl.replace(/\/+$/, '');
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
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
    return res.status(503).json({
      error: 'Google OAuth is not configured on this server. Please use Demo Mode or set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI in Vercel environment variables.'
    });
  }

  try {
    const oauth2Client = getOAuth2Client();
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent'
    });

    res.json({ url: authUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate OAuth URL.' });
  }
});

// OAuth Callback handler (Google redirects user back here)
authRouter.get('/google/callback', async (req: Request, res: Response) => {
  const clientUrl = getClientRedirectUrl();
  const code = req.query.code as string;

  if (!code) {
    return res.redirect(`${clientUrl}/?error=oauth_missing_code`);
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get basic profile to identify email
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const userEmail = profile.data.emailAddress || 'user@gmail.com';

    // Store tokens server-side (persists to Upstash Redis if configured)
    await UserStore.updateTokens(req.userSession.sessionId, userEmail, tokens);

    const isProd = process.env.NODE_ENV === 'production';

    // Set production-ready authentication status cookies
    res.cookie('inbox_quest_authenticated', 'true', {
      httpOnly: false, // Accessible by client app to check logged-in UI state
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.cookie('inbox_quest_demo', 'false', {
      httpOnly: false,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Make sure session cookie is refreshed with same standard settings
    res.cookie('inbox_quest_session', req.userSession.sessionId, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Always redirect back to the client application URL
    res.redirect(clientUrl);
  } catch (error: any) {
    console.error('OAuth Callback Error:', error);
    res.redirect(`${clientUrl}/?error=${encodeURIComponent(error.message || 'oauth_failed')}`);
  }
});

// Activate Demo Mode (loads ~200 sample emails, no login required)
authRouter.post('/demo', (req: Request, res: Response) => {
  req.userSession.isDemo = true;
  getOrCreateDemoProvider(req.userSession.sessionId).reset();

  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('inbox_quest_demo', 'true', {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.clearCookie('inbox_quest_authenticated', { path: '/' });

  res.json({
    success: true,
    message: 'Demo Mode active. 200 sample emails loaded.',
    isDemo: true
  });
});

// Logout / Reset
authRouter.post('/logout', async (req: Request, res: Response) => {
  await UserStore.clearSession(req.userSession.sessionId);

  const isProd = process.env.NODE_ENV === 'production';

  res.clearCookie('inbox_quest_authenticated', { path: '/' });
  res.cookie('inbox_quest_demo', 'true', {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({ success: true });
});
