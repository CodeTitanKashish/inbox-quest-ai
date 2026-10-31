import { EmailItem } from '../../../shared/types';

export const SAMPLE_EMAILS: EmailItem[] = [
  // 1. EDUCATION & ACADEMIC (Protected - Royal Scroll)
  {
    id: 'demo-edu-001',
    threadId: 'thread-edu-001',
    sender: 'Academic Office <academics@stanford.edu>',
    senderEmail: 'academics@stanford.edu',
    recipient: 'me@inboxquest.io',
    subject: 'Official Fall Semester Final Examination Schedule & Hall Ticket',
    snippet: 'Dear Student, the schedule for Fall Semester examinations is released. Please download your hall ticket from the portal and verify examination venue.',
    date: '2026-10-30T09:30:00Z',
    labels: ['INBOX', 'UNREAD'],
    isUnread: true
  },
  {
    id: 'demo-edu-002',
    threadId: 'thread-edu-002',
    sender: 'Office of the Registrar <registrar@mit.edu>',
    senderEmail: 'registrar@mit.edu',
    recipient: 'me@inboxquest.io',
    subject: 'Official Academic Transcript & Degree Verification Request',
    snippet: 'Your requested certified official transcript has been prepared and sealed by the Registrar Office. Download the cryptographic verification certificate.',
    date: '2026-10-28T14:15:00Z',
    labels: ['INBOX'],
    isUnread: false
  },
  {
    id: 'demo-edu-003',
    threadId: 'thread-edu-003',
    sender: 'Financial Aid & Bursar <bursar@university.edu>',
    senderEmail: 'bursar@university.edu',
    recipient: 'me@inboxquest.io',
    subject: 'Tuition Fee Payment Confirmation & Tax Receipt 1098-T',
    snippet: 'We have received your semester tuition payment of $4,850. Attached is your official Bursar tax receipt and clearance certificate.',
    date: '2026-10-25T11:00:00Z',
    labels: ['INBOX'],
    isUnread: false
  },
  {
    id: 'demo-edu-004',
    threadId: 'thread-edu-004',
    sender: 'Prof. David Patterson <pattersond@berkeley.edu>',
    senderEmail: 'pattersond@berkeley.edu',
    recipient: 'me@inboxquest.io',
    subject: 'Invitation: Graduate Computer Architecture Research Lab Assistantship',
    snippet: 'Your recent project proposal in hardware accelerators was exceptional. I would like to invite you to join our lab as a Graduate Research Assistant.',
    date: '2026-10-29T16:45:00Z',
    labels: ['INBOX', 'UNREAD'],
    isUnread: true
  },
  {
    id: 'demo-edu-005',
    threadId: 'thread-edu-005',
    sender: 'Dean of Students <dean@oxford.ac.uk>',
    senderEmail: 'dean@oxford.ac.uk',
    recipient: 'me@inboxquest.io',
    subject: 'Academic Honors & Chancellor Commendation Ceremony',
    snippet: 'Congratulations on achieving Dean List status for consecutive semesters. You are cordially invited to the Academic Honors Convocation.',
    date: '2026-10-22T10:10:00Z',
    labels: ['INBOX'],
    isUnread: false
  },

  // 2. CAREER & PLACEMENTS (Protected - Knowledge Crystal)
  {
    id: 'demo-career-001',
    threadId: 'thread-career-001',
    sender: 'Google Talent Acquisition <recruiting@google.com>',
    senderEmail: 'recruiting@google.com',
    recipient: 'me@inboxquest.io',
    subject: 'Formal Offer Letter: Software Engineer III - Google DeepMind Core Team',
    snippet: 'We are thrilled to extend an official employment offer for the Software Engineer III role. Please review the compensation breakdown, stock grants, and start date.',
    date: '2026-10-31T08:00:00Z',
    labels: ['INBOX', 'UNREAD'],
    isUnread: true
  },
  {
    id: 'demo-career-002',
    threadId: 'thread-career-002',
    sender: 'Microsoft University Recruiting <careers@microsoft.com>',
    senderEmail: 'careers@microsoft.com',
    recipient: 'me@inboxquest.io',
    subject: 'Summer Internship Shortlist & Technical Interview Round 2',
    snippet: 'Congratulations! You have been shortlisted following your preliminary assessment. Please select a time slot for your Round 2 system design interview.',
    date: '2026-10-30T17:20:00Z',
    labels: ['INBOX', 'UNREAD'],
    isUnread: true
  },
  {
    id: 'demo-career-003',
    threadId: 'thread-career-003',
    sender: 'Campus Placement Cell <placements@college.edu.in>',
    senderEmail: 'placements@college.edu.in',
    recipient: 'me@inboxquest.io',
    subject: 'URGENT: Campus Placement Drive Day 1 Schedule & Dress Code',
    snippet: 'All shortlisted candidates for Goldman Sachs and Apple must report to Auditorium B at 8:30 AM with 3 hard copies of their resume and college ID card.',
    date: '2026-10-29T19:00:00Z',
    labels: ['INBOX'],
    isUnread: false
  },
  {
    id: 'demo-career-004',
    threadId: 'thread-career-004',
    sender: 'Stripe Onboarding <onboarding@stripe.com>',
    senderEmail: 'onboarding@stripe.com',
    recipient: 'me@inboxquest.io',
    subject: 'Welcome to Stripe! Action Required: Sign Employment Contract & Equipment Selection',
    snippet: 'Welcome to the team! Before your Day 1 orientation, please sign the confidentiality agreement via DocuSign and choose your development workstation specs.',
    date: '2026-10-27T12:00:00Z',
    labels: ['INBOX'],
    isUnread: false
  },
  {
    id: 'demo-career-005',
    threadId: 'thread-career-005',
    sender: 'Amazon Human Resources <hr-recruiting@amazon.com>',
    senderEmail: 'hr-recruiting@amazon.com',
    recipient: 'me@inboxquest.io',
    subject: 'Amazon Assessment Link: SDE Online Coding Evaluation',
    snippet: 'Your 90-minute online coding assessment is ready. The link will remain active for 72 hours. Ensure a webcam-enabled quiet environment.',
    date: '2026-10-26T15:30:00Z',
    labels: ['INBOX'],
    isUnread: false
  },

  // 3. BANKING & FINANCE (Protected - Golden Relic)
  {
    id: 'demo-fin-001',
    threadId: 'thread-fin-001',
    sender: 'Chase Fraud Prevention <alerts@chase.com>',
    senderEmail: 'alerts@chase.com',
    recipient: 'me@inboxquest.io',
    subject: 'Security Alert: Suspicious transaction attempted on Card ending in 4921',
    snippet: 'Did you authorize a charge of $1,280.00 at TOKYO ELECTRONICS? If YES, reply YES. If NO, reply NO immediately to block your card and issue a refund.',
    date: '2026-10-31T06:14:00Z',
    labels: ['INBOX', 'UNREAD'],
    isUnread: true
  },
  {
    id: 'demo-fin-002',
    threadId: 'thread-fin-002',
    sender: 'HDFC Bank e-Statements <estatements@hdfcbank.net>',
    senderEmail: 'estatements@hdfcbank.net',
    recipient: 'me@inboxquest.io',
    subject: 'Your Monthly Consolidated Account Statement for October 2026',
    snippet: 'Your password-protected electronic statement for account ending in 9032 is ready. Use your Customer ID and date of birth to decrypt.',
    date: '2026-10-30T11:10:00Z',
    labels: ['INBOX'],
    isUnread: false
  },
  {
    id: 'demo-fin-003',
    threadId: 'thread-fin-003',
    sender: 'Silicon Valley Bank Wire Services <wirealerts@svb.com>',
    senderEmail: 'wirealerts@svb.com',
    recipient: 'me@inboxquest.io',
    subject: 'Notification: Incoming International Wire Transfer Credited ($12,500.00 USD)',
    snippet: 'We have processed incoming wire reference SVB-20261029-9182. Funds are now available in your primary checking account.',
    date: '2026-10-29T13:40:00Z',
    labels: ['INBOX'],
    isUnread: false
  },
  {
    id: 'demo-fin-004',
    threadId: 'thread-fin-004',
    sender: 'ADP Payroll Direct Deposit <notifications@adp.com>',
    senderEmail: 'notifications@adp.com',
    recipient: 'me@inboxquest.io',
    subject: 'Salary Credited: Your Payroll Statement for October Pay Period',
    snippet: 'Your direct deposit payroll advice for the period ending October 31 has been processed. Net pay of $7,420.50 deposited.',
    date: '2026-10-31T02:00:00Z',
    labels: ['INBOX'],
    isUnread: false
  },
  {
    id: 'demo-fin-005',
    threadId: 'thread-fin-005',
    sender: 'IRS Tax Notices <notice@irs.gov>',
    senderEmail: 'notice@irs.gov',
    recipient: 'me@inboxquest.io',
    subject: 'Official Confirmation: Federal Tax Return 2025 Processed Successfully',
    snippet: 'The Internal Revenue Service has finalized processing of your Form 1040. Your direct refund has been scheduled for electronic disbursement.',
    date: '2026-10-24T09:00:00Z',
    labels: ['INBOX'],
    isUnread: false
  },

  // 4. OTP & 2FA SECURITY (Protected - Golden Relic)
  {
    id: 'demo-otp-001',
    threadId: 'thread-otp-001',
    sender: 'Google Security <no-reply@accounts.google.com>',
    senderEmail: 'no-reply@accounts.google.com',
    recipient: 'me@inboxquest.io',
    subject: '849201 is your Google verification code',
    snippet: 'Your Google verification code is 849201. Never share this code with anyone. Google will never call to request your code.',
    date: '2026-10-31T11:45:00Z',
    labels: ['INBOX', 'UNREAD'],
    isUnread: true
  },
  {
    id: 'demo-otp-002',
    threadId: 'thread-otp-002',
    sender: 'GitHub Security <support@github.com>',
    senderEmail: 'support@github.com',
    recipient: 'me@inboxquest.io',
    subject: '[GitHub] One-Time Password: 529183',
    snippet: 'Use code 529183 to verify your sign-in attempt from IP 192.0.2.14. This code expires in 10 minutes.',
    date: '2026-10-31T10:15:00Z',
    labels: ['INBOX'],
    isUnread: false
  },
  {
    id: 'demo-otp-003',
    threadId: 'thread-otp-003',
    sender: 'Bank 2FA Authorization <otp-auth@bankofamerica.com>',
    senderEmail: 'otp-auth@bankofamerica.com',
    recipient: 'me@inboxquest.io',
    subject: 'Your One-Time Passcode (OTP) for Wire Authorization: 914028',
    snippet: 'OTP 914028 is valid for wire transfer of $500.00. Do not disclose this OTP to bank executives or callers.',
    date: '2026-10-30T18:02:00Z',
    labels: ['INBOX'],
    isUnread: false
  },

  // 5. OFFICIAL TRAVEL & GOVERNMENT (Protected - Royal Scroll)
  {
    id: 'demo-travel-001',
    threadId: 'thread-travel-001',
    sender: 'United Airlines <reservations@united.com>',
    senderEmail: 'reservations@united.com',
    recipient: 'me@inboxquest.io',
    subject: 'e-Ticket Confirmation & Boarding Pass: SFO to LHR (Confirmation # UA849K)',
    snippet: 'Your electronic ticket receipt for Flight UA 901 departing San Francisco International is confirmed. Terminal 3, Seat 14A.',
    date: '2026-10-28T20:10:00Z',
    labels: ['INBOX'],
    isUnread: false
  },
  {
    id: 'demo-travel-002',
    threadId: 'thread-travel-002',
    sender: 'US Department of State <passportstatus@state.gov>',
    senderEmail: 'passportstatus@state.gov',
    recipient: 'me@inboxquest.io',
    subject: 'Passport Renewal Status: Shipped via Priority Tracking # 9400109202',
    snippet: 'Your passport application has been approved and your new biometric passport book has been dispatched. Track via USPS delivery service.',
    date: '2026-10-27T08:30:00Z',
    labels: ['INBOX'],
    isUnread: false
  }
];

// Helper to generate the remaining ~180 realistic clutter emails (Spam Goblins, Promotion Orcs, Newsletter Skeletons, Notification Zombies, Duplicate Slimes)
const SPAM_TEMPLATES = [
  { sender: 'Global Crypto Lottery <jackpot@claim-bitcoin-reward.xyz>', subject: 'URGENT: You won 4.82 BTC in the 2026 Blockchain Sweepstakes', snippet: 'Your email address was selected in the international crypto lottery. Deposit 0.01 BTC processing fee to release your private key vault immediately.' },
  { sender: 'Barrister Williams Chambers <barrister@estate-offices.co.uk>', subject: 'STRICTLY CONFIDENTIAL: Unclaimed Inheritance of $8,400,000 USD', snippet: 'I represent late diplomat Dr. Arthur Sterling. As his sole surname namesake, you are designated beneficiary. Reply immediately to claim the funds.' },
  { sender: 'Health Miracle Lab <keto@burnfatsuperfast.biz>', subject: 'Doctors stunned: Drink 1 cup before bed to melt belly fat overnight', snippet: 'The billion-dollar pharmaceutical secret they tried to ban. No diet, no exercise, 100% natural herbal remedy discovered in remote mountains.' },
  { sender: 'VIP Casino Palace <cashback@spinandwin777.top>', subject: '300 Free Spins + $5,000 Welcome Deposit Match waiting for you!', snippet: 'Your account has been credited with VIP gold status! Spin the wheel of fortune right now before your bonus token expires at midnight.' },
  { sender: 'Account Security Department <verify@apple-cloud-id-recover.info>', subject: 'URGENT: Your cloud storage has been locked due to suspicious activity', snippet: 'Suspicious files were detected in your cloud drive. Click here to unlock your cloud storage immediately or files will be purged.' },
  { sender: 'Dubai Gold Exchange <investments@emirates-gold-returns.cc>', subject: 'Guaranteed 250% ROI every 14 days with AI Gold Trading Bots', snippet: 'Join hundreds of elite investors generating passive income automated on autopilot. Start with as little as $100 today.' }
];


const PROMOTION_TEMPLATES = [
  { sender: 'Nike Official Store <news@nike.com>', subject: 'FLASH SALE: 40% Off Pegasus & Air Max sneakers this weekend only', snippet: 'Upgrade your training kit with exclusive discounts across member favorites. Free shipping on all orders over $50.' },
  { sender: 'Amazon Deals <daily-deals@amazon.com>', subject: 'Lightning Deal: Smart 4K OLED TVs up to $600 off today only', snippet: 'Save huge on top brands like Sony, LG, and Samsung. Prime members get free same-day delivery on select electronics.' },
  { sender: 'Steam Store <store@steampowered.com>', subject: 'The Autumn Sale is LIVE! Over 20,000 games on massive discount', snippet: 'Top titles on your wishlist are currently on sale! Cyberpunk 2077, Elden Ring, and Hades II are up to 60% off.' },
  { sender: 'Uber Eats <offers@ubereats.com>', subject: 'Craving pizza or tacos? Take $15 off your next 3 dinner deliveries', snippet: 'Use promo code FEAST15 at checkout to unlock savings from your neighborhood favorites. Terms apply.' },
  { sender: 'Zara Fashion <newsletter@zara.com>', subject: 'New Winter Collection drops tomorrow: Explore the seasonal lookbook', snippet: 'Tailored overcoats, heavy knits, and modern silhouettes. Preview the collection online before stores open.' },
  { sender: 'Coursera Discounts <promotions@coursera.org>', subject: '75% OFF Coursera Plus Annual: Learn Deep Learning & Cloud Computing', snippet: 'Unlimited access to 7,000+ courses, professional certificates, and degrees from Google, IBM, and top universities.' }
];

const NEWSLETTER_TEMPLATES = [
  { sender: 'The Pragmatic Engineer <newsletter@pragmaticengineer.com>', subject: 'The State of Software Engineering Compensation in 2026', snippet: 'A deep dive into tech hiring trends, AI engineering salaries, return-to-office mandates, and senior staff equity packages across the industry.' },
  { sender: 'TLDR Tech <dan@tldr.tech>', subject: 'TLDR Tech: Autonomous AI agents build full operating systems', snippet: 'Big tech reports Q3 earnings, breakthroughs in silicon photonics, and the latest open-source LLM releases for local inference.' },
  { sender: 'ByteByteGo System Design <newsletter@bytebytego.com>', subject: 'How YouTube serves billions of video streams with sub-second latency', snippet: 'Understanding CDN cache topologies, adaptive bitrate streaming algorithms, and distributed video transcode pipelines.' },
  { sender: 'Substack Weekly Digest <digest@substack.com>', subject: '5 essays you should not miss this week on technology and culture', snippet: 'Curated reads exploring the philosophy of work, the future of cities, and how generative models are transforming creative industries.' },
  { sender: 'Frontend Focus <contact@frontendfoc.us>', subject: 'Frontend Focus #632: CSS Grid subgrid, WebAssembly GC, and Vite 6', snippet: 'The latest news, tutorials, and performance benchmarks for web developers building modern responsive experiences.' }
];

const SOCIAL_TEMPLATES = [
  { sender: 'LinkedIn Notifications <notifications@linkedin.com>', subject: '14 people viewed your profile this week, including recruiters at Apple', snippet: 'See who is looking at your background and expand your network with 1-click connection recommendations.' },
  { sender: 'Twitter / X <notify@x.com>', subject: 'Weekly highlights: What happened in #MachineLearning and #TypeScript', snippet: 'Top posts from developers you follow, trending discussions, and viral code snippets you missed.' },
  { sender: 'GitHub <notifications@github.com>', subject: '[inbox-quest-ai] 3 pull requests merged and 1 security advisory resolved', snippet: 'Dependabot updated dependencies in your repository. All automated integration tests passed cleanly.' },
  { sender: 'Reddit Daily <digest@redditmail.com>', subject: 'Trending on r/webdev: Why Vanilla CSS is making a massive comeback', snippet: 'Join 412 comments discussing modern CSS nesting, variables, and whether utility frameworks are still necessary.' },
  { sender: 'Duolingo Streak <reminders@duolingo.com>', subject: "Keep Duo happy! Your 52-day Japanese language streak will expire at midnight", snippet: "Spend just 3 minutes practicing kanji and vocabulary to preserve your streak and earn double gems." }
];

// Generate additional structured sample items to reach ~200 total emails
function generateAdditionalEmails(): EmailItem[] {
  const items: EmailItem[] = [];
  const baseDate = new Date('2026-10-31T12:00:00Z');

  // Generate 45 Spam Goblins
  for (let i = 1; i <= 45; i++) {
    const t = SPAM_TEMPLATES[i % SPAM_TEMPLATES.length];
    const itemDate = new Date(baseDate.getTime() - i * 3600 * 1000 * 4);
    items.push({
      id: `demo-spam-${String(i).padStart(3, '0')}`,
      threadId: `thread-spam-${String(i).padStart(3, '0')}`,
      sender: t.sender,
      senderEmail: t.sender.match(/<([^>]+)>/)?.[1] || 'spam@junk.org',
      recipient: 'me@inboxquest.io',
      subject: `${t.subject} #${i}`,
      snippet: t.snippet,
      date: itemDate.toISOString(),
      labels: ['INBOX', 'UNREAD'],
      isUnread: true
    });
  }

  // Generate 55 Promotion Orcs
  for (let i = 1; i <= 55; i++) {
    const t = PROMOTION_TEMPLATES[i % PROMOTION_TEMPLATES.length];
    const itemDate = new Date(baseDate.getTime() - i * 3600 * 1000 * 3);
    items.push({
      id: `demo-promo-${String(i).padStart(3, '0')}`,
      threadId: `thread-promo-${String(i).padStart(3, '0')}`,
      sender: t.sender,
      senderEmail: t.sender.match(/<([^>]+)>/)?.[1] || 'promo@deals.com',
      recipient: 'me@inboxquest.io',
      subject: `${t.subject} (Discount Ref ${i})`,
      snippet: t.snippet,
      date: itemDate.toISOString(),
      labels: ['INBOX'],
      isUnread: i % 2 === 0
    });
  }

  // Generate 40 Newsletter Skeletons
  for (let i = 1; i <= 40; i++) {
    const t = NEWSLETTER_TEMPLATES[i % NEWSLETTER_TEMPLATES.length];
    const itemDate = new Date(baseDate.getTime() - i * 3600 * 1000 * 6);
    items.push({
      id: `demo-news-${String(i).padStart(3, '0')}`,
      threadId: `thread-news-${String(i).padStart(3, '0')}`,
      sender: t.sender,
      senderEmail: t.sender.match(/<([^>]+)>/)?.[1] || 'news@digest.org',
      recipient: 'me@inboxquest.io',
      subject: `${t.subject} (Issue #${100 + i})`,
      snippet: t.snippet,
      date: itemDate.toISOString(),
      labels: ['INBOX'],
      isUnread: i % 3 === 0
    });
  }

  // Generate 35 Notification Zombies
  for (let i = 1; i <= 35; i++) {
    const t = SOCIAL_TEMPLATES[i % SOCIAL_TEMPLATES.length];
    const itemDate = new Date(baseDate.getTime() - i * 3600 * 1000 * 5);
    items.push({
      id: `demo-social-${String(i).padStart(3, '0')}`,
      threadId: `thread-social-${String(i).padStart(3, '0')}`,
      sender: t.sender,
      senderEmail: t.sender.match(/<([^>]+)>/)?.[1] || 'social@alerts.net',
      recipient: 'me@inboxquest.io',
      subject: `${t.subject} (Ping #${i})`,
      snippet: t.snippet,
      date: itemDate.toISOString(),
      labels: ['INBOX'],
      isUnread: i % 2 === 1
    });
  }

  // Generate 15 Duplicate Slimes (repeated automated notifications)
  for (let i = 1; i <= 15; i++) {
    const itemDate = new Date(baseDate.getTime() - i * 3600 * 1000 * 2);
    items.push({
      id: `demo-duplicate-${String(i).padStart(3, '0')}`,
      threadId: `thread-duplicate-${String(i).padStart(3, '0')}`,
      sender: 'Automated Build System <ci-cd@cloudbuild.gserviceaccount.com>',
      senderEmail: 'ci-cd@cloudbuild.gserviceaccount.com',
      recipient: 'me@inboxquest.io',
      subject: `Automatic build artifact sync complete: Pipeline run #${4000 + i}`,
      snippet: `Workflow build passed successfully in 32 seconds. No new changes detected. Docker digest matches base tag sha256:8291a...`,
      date: itemDate.toISOString(),
      labels: ['INBOX'],
      isUnread: false
    });
  }

  return items;
}

export const ALL_DEMO_EMAILS: EmailItem[] = [
  ...SAMPLE_EMAILS,
  ...generateAdditionalEmails()
];
