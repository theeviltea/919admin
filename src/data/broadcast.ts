// Push notifications and email campaigns: audience, reach, test sends and history.
// With VITE_API_URL the admin calls the endpoints listed in the README; without it everything below is mock.
import { API_URL } from './api';

export type Channel = 'push' | 'email';
export type Lang = 'ru' | 'en';
export type Text = { title: string; body: string };
export type Who = 'all' | 'seekers' | 'employers';
export type AppKind = 'both' | 'old' | 'new';
export type Audience = { who: Who; app: AppKind; country: string; city: string; from: string; to: string; lang: 'any' | Lang };
export type Reach = { match: number; reach: number };
export type Campaign = {
  id: string;
  channel: Channel;
  status: 'sending' | 'done' | 'failed';
  text: Partial<Record<Lang, Text>>;
  audience: Audience;
  total: number;
  sent: number;
  /** Token or address no longer exists: the app was removed, the account closed. */
  gone: number;
  failed: number;
  error?: string;
  by: string;
  started: number;
  ended?: number;
};

export const EMPTY_AUDIENCE: Audience = { who: 'all', app: 'both', country: '', city: '', from: '', to: '', lang: 'any' };

export const COUNTRIES: Record<string, string[]> = {
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman'],
  Kyrgyzstan: ['Bishkek', 'Osh'],
  Kazakhstan: ['Almaty', 'Astana'],
  Russia: ['Moscow', 'Saint Petersburg', 'Kazan'],
  Uzbekistan: ['Tashkent', 'Samarkand'],
};

export const LIMITS: Record<Channel, { title: number; body: number }> = {
  push: { title: 100, body: 500 },
  email: { title: 200, body: 20000 },
};

/** Mock reach: share of 12,298 accounts; push needs a device token, email needs an address. */
export function mockReach(channel: Channel, a: Audience): Reach {
  let n = 12298;
  n *= a.who === 'seekers' ? 0.8 : a.who === 'employers' ? 0.2 : 1;
  if (a.country) n *= a.country === 'United Arab Emirates' ? 0.46 : 0.09;
  if (a.city) n *= 0.55;
  if (a.from || a.to) n *= 0.4;
  n *= a.lang === 'ru' ? 0.58 : a.lang === 'en' ? 0.42 : 1;
  const match = Math.round(n);
  const share = channel === 'email' ? 0.63 : a.app === 'old' ? 0.17 : a.app === 'new' ? 0.071 : 0.2406;
  return { match, reach: Math.round(match * share) };
}

const nov = (d: number, h: number, m: number) => Date.UTC(2026, 10, d, h - 6, m);
const BAD_TOKEN = 'The registration token is not a valid FCM registration token';

export const mockHistory: Campaign[] = [
  {
    id: 'p2',
    channel: 'push',
    status: 'done',
    text: {
      ru: { title: 'Новые вакансии уже ждут вас! 🔥', body: 'Загляните в 919 — выбирайте интересные предложения, откликайтесь и сделайте следующий шаг в карьере.' },
      en: { title: 'New jobs are waiting for you! 🔥', body: 'Explore the latest opportunities on 919, apply to your favorites, and take the next step in your career.' },
    },
    audience: EMPTY_AUDIENCE,
    total: 2959,
    sent: 2955,
    gone: 1,
    failed: 3,
    error: BAD_TOKEN,
    by: 'Admin',
    started: nov(4, 13, 6),
    ended: nov(4, 13, 6) + 40_000,
  },
  {
    id: 'p1',
    channel: 'push',
    status: 'done',
    text: {
      ru: { title: '919 снова онлайн! 🚀', body: 'Мы вернулись — ещё лучше и быстрее! Новые горячие вакансии уже ждут вас. Заходите!' },
      en: { title: '919 is back online! 🚀', body: 'We’re back, better and faster than ever! Hot new jobs are waiting for you. Jump in!' },
    },
    audience: EMPTY_AUDIENCE,
    total: 8929,
    sent: 2952,
    gone: 5974,
    failed: 3,
    error: BAD_TOKEN,
    by: 'Admin',
    started: nov(2, 17, 40),
    ended: nov(2, 17, 42),
  },
];

/** The mail server is set on the backend (SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_FROM). */
export const mockMail = { configured: false, from: '' };

async function req<T>(path: string, body?: unknown): Promise<T> {
  let token = '';
  try {
    token = localStorage.getItem('919admin.token') ?? '';
  } catch {
    /* storage unavailable */
  }
  const res = await fetch(`${API_URL}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return res.json();
}

export const broadcast = {
  history: (c: Channel) => (API_URL ? req<Campaign[]>(`/admin/${c}/campaigns`) : Promise.resolve(mockHistory.filter((h) => h.channel === c))),
  reach: (c: Channel, a: Audience) => (API_URL ? req<Reach>(`/admin/${c}/reach`, a) : Promise.resolve(mockReach(c, a))),
  mail: () => (API_URL ? req<{ configured: boolean; from: string }>('/admin/email/server') : Promise.resolve(mockMail)),
  test: (c: Channel, to: string, text: Partial<Record<Lang, Text>>, lang: Lang) =>
    API_URL ? req<{ ok: true }>(`/admin/${c}/test`, { to, text, lang }) : new Promise((r) => setTimeout(() => r({ ok: true }), 500)),
  send: (c: Channel, text: Partial<Record<Lang, Text>>, audience: Audience) =>
    API_URL ? req<Campaign>(`/admin/${c}/campaigns`, { text, audience }) : Promise.resolve(null),
};
