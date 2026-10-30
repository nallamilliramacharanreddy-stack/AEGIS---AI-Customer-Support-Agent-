export interface Ticket {
  id: string;
  customerName: string;
  customerAvatar: string;
  email: string;
  subject: string;
  description: string;
  category: 'Technical' | 'Billing' | 'Account Access' | 'Bug Report' | 'Feature Request' | 'General Inquiry';
  priority: 'P1 - Critical' | 'P2 - High' | 'P3 - Medium' | 'P4 - Low';
  status: 'Open' | 'Pending AI' | 'Resolved' | 'Escalated';
  sentiment: 'Positive' | 'Neutral' | 'Frustrated' | 'Angry' | 'Urgent';
  confidence: number;
  createdAt: string;
  aiSuggestedReply?: string;
}

export const MOCK_TICKETS: Ticket[] = [
  {
    id: 'TCK-9401',
    customerName: 'Sarah Jenkins',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    email: 'sarah.j@stripe-client.com',
    subject: 'API Webhook signature validation failing after v2.4 upgrade',
    description: 'Our production webhook endpoint received 500 error due to signature verification mismatch on HMAC-SHA256 headers after the recent v2.4 release.',
    category: 'Technical',
    priority: 'P1 - Critical',
    status: 'Open',
    sentiment: 'Urgent',
    confidence: 98.4,
    createdAt: '12 mins ago',
    aiSuggestedReply: 'Our diagnostic pipeline detected a header casing change in v2.4 (x-aegis-signature-256). Please verify your HMAC hashing buffer encoding using UTF-8.'
  },
  {
    id: 'TCK-9402',
    customerName: 'Alex Rivera',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    email: 'alex@linear-team.org',
    subject: 'Accidental duplicate subscription charge on Pro Plan',
    description: 'I noticed two separate pending charges of $199 on our invoice #INV-8821. Need immediate refund for the duplicate charge.',
    category: 'Billing',
    priority: 'P2 - High',
    status: 'Pending AI',
    sentiment: 'Frustrated',
    confidence: 96.1,
    createdAt: '28 mins ago',
    aiSuggestedReply: 'Duplicate charge #INV-8821-B has been flagged for auto-reversal. The $199 credit will reflect on your card statement within 24 hours.'
  },
  {
    id: 'TCK-9403',
    customerName: 'Elena Rostova',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    email: 'elena@vercel-partner.io',
    subject: 'Requesting SAML SSO configuration guide for Okta',
    description: 'We are expanding our team to 500 enterprise users and need to connect Okta SAML 2.0 Single Sign-On to our workspace.',
    category: 'Account Access',
    priority: 'P3 - Medium',
    status: 'Resolved',
    sentiment: 'Positive',
    confidence: 99.1,
    createdAt: '1 hour ago',
    aiSuggestedReply: 'SAML 2.0 Integration guide and Metadata XML endpoint URL sent. Your Okta tenant can be linked directly under Admin -> Security -> SSO.'
  },
  {
    id: 'TCK-9404',
    customerName: 'Marcus Vance',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    email: 'm.vance@figma-designers.co',
    subject: 'Feature Request: Export Analytics CSV with custom date range',
    description: 'It would be amazing if the analytics export button allowed filtering by arbitrary timestamp intervals instead of fixed monthly blocks.',
    category: 'Feature Request',
    priority: 'P4 - Low',
    status: 'Open',
    sentiment: 'Positive',
    confidence: 92.8,
    createdAt: '2 hours ago'
  },
  {
    id: 'TCK-9405',
    customerName: 'David Chen',
    customerAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    email: 'dchen@notion-users.net',
    subject: 'Infinite loading spinner on Knowledge Base search bar',
    description: 'When typing Japanese characters into the search bar, the UI freezes with a memory leak in the browser console.',
    category: 'Bug Report',
    priority: 'P2 - High',
    status: 'Escalated',
    sentiment: 'Angry',
    confidence: 94.7,
    createdAt: '4 hours ago'
  }
];

export const MOCK_CHART_DATA = [
  { time: '00:00', totalTickets: 42, aiResolved: 38, csat: 4.8 },
  { time: '04:00', totalTickets: 28, aiResolved: 26, csat: 4.9 },
  { time: '08:00', totalTickets: 125, aiResolved: 112, csat: 4.7 },
  { time: '12:00', totalTickets: 240, aiResolved: 221, csat: 4.95 },
  { time: '16:00', totalTickets: 198, aiResolved: 184, csat: 4.88 },
  { time: '20:00', totalTickets: 89, aiResolved: 82, csat: 4.92 },
];

export const MOCK_CATEGORY_DISTRIBUTION = [
  { name: 'Technical', value: 42, color: '#6366F1' },
  { name: 'Billing', value: 24, color: '#06B6D4' },
  { name: 'Account Access', value: 18, color: '#10B981' },
  { name: 'Bug Report', value: 10, color: '#8B5CF6' },
  { name: 'Feature Request', value: 6, color: '#F97316' },
];

export const MOCK_SENTIMENT_TIMELINE = [
  { day: 'Mon', positive: 78, neutral: 14, negative: 8 },
  { day: 'Tue', positive: 82, neutral: 12, negative: 6 },
  { day: 'Wed', positive: 88, neutral: 8, negative: 4 },
  { day: 'Thu', positive: 85, neutral: 10, negative: 5 },
  { day: 'Fri', positive: 91, neutral: 6, negative: 3 },
  { day: 'Sat', positive: 94, neutral: 4, negative: 2 },
  { day: 'Sun', positive: 96, neutral: 3, negative: 1 },
];

export const MOCK_KB_ARTICLES = [
  {
    id: 'kb-1',
    title: 'Setting Up HMAC Webhook Signatures & IP Whitelisting',
    category: 'API & Developer',
    readTime: '4 min read',
    rating: 4.9,
    views: '14.2k',
    content: 'Learn how to cryptographically verify incoming payload signatures from Aegis webhooks using SHA-256 HMAC keys and configure IP ranges.',
    tags: ['Webhooks', 'Security', 'API', 'Node.js']
  },
  {
    id: 'kb-2',
    title: 'Managing Enterprise SAML 2.0 Single Sign-On (Okta / Azure AD)',
    category: 'Account & Security',
    readTime: '6 min read',
    rating: 4.95,
    views: '18.9k',
    content: 'Step-by-step setup guide for connecting enterprise identity providers via SAML 2.0, SCIM provisioning, and automated user lifecycle mapping.',
    tags: ['SAML', 'SSO', 'Okta', 'Security']
  },
  {
    id: 'kb-3',
    title: 'Understanding AI Confidence Scores & Threshold Automation',
    category: 'Machine Learning',
    readTime: '5 min read',
    rating: 4.88,
    views: '9.8k',
    content: 'Discover how Aegis computes intent confidence matrices and configures automated ticket resolution rules based on precision control bounds.',
    tags: ['ML', 'Automation', 'Confidence', 'AI']
  },
  {
    id: 'kb-4',
    title: 'Invoice Generation, Pro-Rata Upgrades & Refund Policies',
    category: 'Billing',
    readTime: '3 min read',
    rating: 4.76,
    views: '22.1k',
    content: 'Clear overview of billing cycles, automated pro-rata credit calculations, corporate VAT invoicing, and 30-day money-back guarantee terms.',
    tags: ['Billing', 'Refunds', 'Invoices', 'Tax']
  }
];
