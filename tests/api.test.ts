import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server/src/index';

describe('API Route Integration Tests', () => {
  it('GET /api/health returns status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.app).toBe('Inbox Quest AI');
  });

  it('GET /api/auth/status returns demo status by default', async () => {
    const res = await request(app).get('/api/auth/status');
    expect(res.status).toBe(200);
    expect(res.body.isDemo).toBe(true);
    expect(res.body.isAuthenticated).toBe(false);
  });

  it('GET /api/emails returns paginated sample emails in demo mode', async () => {
    const res = await request(app).get('/api/emails?limit=10');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.emails)).toBe(true);
    expect(res.body.emails.length).toBe(10);
    expect(res.body.totalCount).toBeGreaterThan(150);

    // Verify each email has classification enriched
    const first = res.body.emails[0];
    expect(first.id).toBeDefined();
    expect(first.subject).toBeDefined();
    expect(first.classification).toBeDefined();
    expect(first.classification.category).toBeDefined();
  });

  it('GET /api/emails/dashboard returns stats and AI insight line', async () => {
    const res = await request(app).get('/api/emails/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.totalEmails).toBeGreaterThan(150);
    expect(res.body.protectedCount).toBeGreaterThan(0);
    expect(res.body.aiInsight).toContain('emails');
    expect(res.body.aiInsight).toContain('sacred relics');
  });

  it('POST /api/actions/batch rejects protected emails with HTTP 403', async () => {
    // demo-edu-001 is a Stanford final exam notice (Protected)
    const res = await request(app)
      .post('/api/actions/batch')
      .send({
        emailIds: ['demo-edu-001'],
        labelName: 'InboxQuest/Spam'
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Forbidden');
    expect(res.body.protectedEmailIds).toContain('demo-edu-001');
  });

  it('POST /api/actions/batch succeeds on non-protected spam emails', async () => {
    const res = await request(app)
      .post('/api/actions/batch')
      .send({
        emailIds: ['demo-spam-005', 'demo-spam-006'],
        labelName: 'InboxQuest/Spam',
        enemyType: 'SPAM_GOBLIN'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.modifiedCount).toBe(2);
    expect(res.body.undoToken).toBeDefined();
    expect(res.body.xpEarned).toBeGreaterThan(0);
  });
});
