# 🛡️ Inbox Quest AI: Kingdom of Productivity

> **Turn email cleanup into an epic fantasy RPG powered by Google Gemini AI, with ironclad backend protection for college notices, job offers, banking records, and OTPs.**

---

## 🏆 Project Description (For Submission Form)

> **Inbox Quest AI** transforms the dread of email triage into a fantasy RPG where slaying digital clutter (Spam Goblins, Promotion Orcs, and Newsletter Skeletons) organizes your Gmail in the background. Powered by Google Gemini AI (`@google/genai`), the app analyzes message snippets with structured schemas while an ironclad backend Protection Engine strictly prevents accidental archiving or deletion of critical records (college notices, internships, job offers, bank alerts, and 2FA OTPs)—enforced with HTTP 403 rejections and zero destructive endpoints. Featuring a 200-email instant Demo Mode, procedural retro Web Audio sound effects, a non-timed Calm Mode (WCAG 2.1 AA), and one-click reversible Undo, it turns inbox zero into a triumphant quest.

---

## ⚔️ The Problem & The Solution

- **The Problem:** People avoid cleaning massive inboxes because they fear losing critical emails: university examination notices, job and internship offers, tax receipts, bank fraud alerts, and security OTPs.
- **The Solution:** Inbox Quest AI introduces a **Guardian RPG Paradigm**:
  - Critical emails appear in-game as inviolable **Royal Scrolls, Golden Relics, and Knowledge Crystals** that players must protect and can never attack.
  - Clutter emails appear as digital monsters that players attack via keyboard or mouse.
  - Defeating monsters triggers real, safe batch organization (applying `InboxQuest/*` labels and archiving).
  - The app **NEVER permanently deletes or trashes emails**. Every action is logged and reversible with one-click **Undo**.

---

## 🏰 Architecture Overview

```mermaid
graph TD
    subgraph Client ["Frontend (React + Vite + TypeScript)"]
        UI[Kingdom Dashboard & Arena]
        Audio[Web Audio Procedural Synth]
        Accessibility[ARIA Live Announcer & Calm Mode]
    end

    subgraph Server ["Backend (Node.js + Express + TypeScript)"]
        Auth[OAuth 2.0 & Session Middleware]
        ProtectionEngine[Backend Protection Engine]
        ActionGuard[Action Guard (HTTP 403 Enforcement)]
        UndoManager[Reversible Undo Log]
        Gemini[Gemini AI Engine & Rule Fallback]
    end

    subgraph External ["Data & Cloud Services"]
        GmailAPI[Gmail API (gmail.modify only)]
        DemoProvider[Demo Provider (200 Curated Emails)]
        GeminiAPI[Google Gemini 2.5 Flash]
        CloudRun[Google Cloud Run Container (PORT 8080)]
    end

    UI <--> Server
    Server --> ProtectionEngine
    ProtectionEngine --> ActionGuard
    ActionGuard --> GmailAPI
    ActionGuard --> DemoProvider
    ActionGuard --> UndoManager
    Server --> Gemini
    Gemini --> GeminiAPI
```

---

## 🌟 Key Features

### 1. Ironclad Protection Engine (Enforced at Backend API)
- **Automatic Rule-Based Pattern Matching**: Scans senders, domains, subjects, and snippets for:
  - **Academic / College**: `.edu`, `.ac.in`, `semester`, `examination`, `hall ticket`, `transcript`, `bursar`, `tuition fee`.
  - **Career & Placement**: `offer letter`, `internship`, `interview`, `campus placement`, `recruiter`, `assessment link`.
  - **Banking & Finance**: `bank statement`, `transaction alert`, `credit card`, `salary credited`, `wire transfer`, `tax return`.
  - **Security OTPs / 2FA**: `verification code`, `one-time password`, `otp`, `2fa`, `auth code`.
  - **Official Travel / Govt**: `passport`, `visa`, `boarding pass`, `ticket confirmation`, `pnr`.
- **Backend HTTP 403 Enforcement**: Rejects any attempt to archive or alter a protected email at the API layer, returning an explicit `403 Forbidden` response.
- **Zero Destructive APIs**: The application code contains **zero** calls or references to `gmail.users.messages.delete` or `gmail.users.messages.trash`.
- **Reversible Undo**: Every action creates an undo token that snapshots prior label and inbox states, allowing instant 1-click rollback.

### 2. Gemini AI Intelligence & Privacy Shield
- **Official `@google/genai` SDK**: Uses `gemini-2.5-flash` with structured JSON output and schema validation.
- **Privacy Shield**: Sends **only** `sender`, `subject`, and short `snippet` to Gemini. Full email bodies are **never accessed or transmitted**. A clear disclosure banner informs the user in the UI.
- **Fail-Safe Fallback**: If Gemini encounters rate limits or network hiccups, an internal deterministic rule-based classifier automatically takes over with zero disruption.
- **In-Memory Caching**: Classifications are cached by `messageId` to eliminate duplicate API requests.

### 3. Fantasy RPG Gamification
- **Monster Factions**:
  - 👺 **Spam Goblins**: Purges dubious sweepstakes and crypto scams under `InboxQuest/Spam`.
  - 👹 **Promotion Orcs**: Archives aggressive flash sales under `InboxQuest/Promotions`.
  - 💀 **Newsletter Skeletons**: Organizes weekly digests under `InboxQuest/Newsletters`.
  - 🧟 **Notification Zombies**: Clears social media pings under `InboxQuest/Social`.
  - 🫧 **Duplicate Slimes**: Consolidates repetitive automated build logs and thread duplicates.
- **Sacred Relics**:
  - 📜 **Royal Scrolls**: University notices and official certificates.
  - 👑 **Golden Relics**: Treasury alerts, bank statements, and OTP wards.
  - 💎 **Knowledge Crystals**: Job offers, interview links, and internship contracts.
- **Combat Controls**: Playable with keyboard (`1` Royal Slash, `2` Flame Ward, `3` Holy Smite, `Space` Quick Attack) or mouse clicks.
- **Procedural Audio**: Pure browser Web Audio API synthesizer generates retro 8-bit sword swings, magic chimes, and level-up fanfares with zero audio files to download.

### 4. Demo Mode (Full Experience Without Gmail Login)
- A **"Try Demo"** button instantly loads **200 realistic, handcrafted sample emails** covering all edge cases.
- Operates on the exact same `IEmailProvider` code path as live Gmail mode.

### 5. Accessibility (WCAG 2.1 AA)
- **Calm Mode**: Untimed, turn-based mode with zero flashing lights or rapid timers.
- **Screen Reader Announcements**: Hidden `aria-live="polite"` region speaks all combat hits, level-ups, and email actions.
- **Full Keyboard Navigation**: Visible focus rings (`outline: 3px solid #fbbf24`), logical tab order, and hotkeys.
- **Reduced Motion Support**: Honors `@media (prefers-reduced-motion: reduce)`.

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Node.js v20+ and npm

### 1. Clone & Install
```bash
git clone https://github.com/your-username/inbox-quest-ai.git
cd inbox-quest-ai

# Install root, server, and client dependencies
npm install
npm --prefix server install
npm --prefix client install
```

### 2. Environment Configuration
Copy the template and configure your secrets:
```bash
cp .env.example .env
```
Fill in `.env`:
```env
PORT=8080
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:8080/api/auth/google/callback
```
*(Note: If no Google credentials are provided, the app will run seamlessly in Demo Mode with 200 realistic sample emails!)*

### 3. Run Locally
```bash
# Run backend server in watch mode
npm run dev

# Or run client separately in development
npm run dev:client
```
Open **`http://localhost:8080`** in your browser.

---

## 🧪 Testing Suite

Inbox Quest AI comes with a comprehensive Vitest unit and integration test suite:
```bash
npm test
```

### Test Coverage Highlights (30 / 30 Tests Passing):
- **`tests/protection.test.ts`**: Verifies academic, career, banking, OTP, and AI category triggers.
- **`tests/classifier.test.ts`**: Verifies rule classifier, scoring, and schema validation.
- **`tests/action-guard.test.ts`**: Verifies HTTP 403 on protected emails, safe batch archiving, and undo rollback.
- **`tests/api.test.ts`**: Verifies `/api/health`, `/api/auth/status`, `/api/emails/dashboard`, and batch action endpoints.

---

## 🐳 Docker & Google Cloud Run Deployment

The project is packaged in a single multi-stage `Dockerfile` listening on the `$PORT` environment variable.

### Build and Run Locally with Docker
```bash
docker build -t inbox-quest-ai .
docker run -p 8080:8080 -e PORT=8080 -e NODE_ENV=production inbox-quest-ai
```

### Deploy to Google Cloud Run
```bash
# 1. Authenticate with Google Cloud
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# 2. Build and submit container via Cloud Build
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/inbox-quest-ai

# 3. Deploy to Cloud Run
gcloud run deploy inbox-quest-ai \
  --image gcr.io/YOUR_PROJECT_ID/inbox-quest-ai \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,GEMINI_MODEL=gemini-2.5-flash \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest,GOOGLE_CLIENT_ID=google-client-id:latest,GOOGLE_CLIENT_SECRET=google-client-secret:latest
```

---

## 🔒 Security & Privacy Model

- **Minimal OAuth Scope**: Requests strictly `https://www.googleapis.com/auth/gmail.modify` (never full mail read/delete scopes).
- **Server-Side Token Storage**: OAuth access and refresh tokens are stored in server memory/sessions only and are never exposed to the client.
- **Secure Cookies**: Session identifiers use `httpOnly`, `secure`, `sameSite: lax/none`.
- **Zero Permanent Deletion**: The application has no capability or API endpoints to call `users.messages.delete` or `users.messages.trash`.
- **Defensive API Guard**: Any batch request containing a protected email ID is aborted with HTTP 403 Forbidden.
- **Security Headers**: Hardened with `helmet`, Content Security Policy (CSP), and `express-rate-limit` (500 requests per 15 minutes).

---

## 📜 License
MIT License. Built for the Gemini Developer Competition.
