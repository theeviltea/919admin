// Admin domain types. Mirrors what the 919 backend returns to the admin API (see src/data/api.ts).

export type Tier = 'free' | 'premium' | 'max';
export type Frame = 'gold' | 'ocean' | 'neon';
export type SeekerStatus = 'active' | 'hidden' | 'blocked';
/** Account check (can the company post vacancies). The verified badge comes from the trade licence, see Licence. */
export type CompanyStatus = 'approved' | 'pending' | 'rejected' | 'blocked';
export type LicenceStatus = 'none' | 'review' | 'rejected' | 'verified';
/** Trade licence PDF. Seen only in the admin; an approved licence gives the company the verified badge in the app. */
export type Licence = {
  status: LicenceStatus;
  file?: { name: string; size: string; pages: number; url?: string };
  sentAt?: string;
  checkedAt?: string;
  checkedBy?: string;
  reason?: string;
  issuer?: string;
  activity?: string;
  validUntil?: string;
};
export type VacancyStatus = 'live' | 'review' | 'changes' | 'paused' | 'closed' | 'rejected';
export type ReportKind = 'message' | 'company' | 'person' | 'vacancy';
export type ReportStatus = 'new' | 'progress' | 'closed';
export type Check = { level: 'ok' | 'warn' | 'bad'; title: string; note: string };
export type LogItem = { at: string; text: string };

export type Seeker = {
  id: string;
  name: string;
  photo: string;
  tier: Tier;
  frame?: Frame;
  header?: string;
  field: string;
  role: string;
  city: string;
  age: number;
  gender: 'Female' | 'Male';
  completeness: number;
  joined: string;
  lastActive: string;
  status: SeekerStatus;
  phone: string;
  email: string;
  platform: string;
  photos: string[];
  videos: { title: string; duration: string; views: string; poster: string }[];
  about: string;
  languages: [string, string][];
  details: [string, string][];
  experience: { role: string; place: string; period: string }[];
  education: { title: string; school: string; years: string }[];
  links: { code: string; label: string; value: string }[];
  stats: { views: string; applications: string; accepted: string; invites: string; chats: string };
  plan?: { since: string; renews: string; payment: string };
  reports: number;
  log: LogItem[];
};

export type Recruiter = {
  id: string;
  name: string;
  photo: string;
  companyId: string;
  role: 'Admin' | 'Recruiter';
  title: string;
  phone: string;
  email: string;
  since: string;
  lastActive: string;
  vacancies: number;
  chats: number;
  hires: number;
  status: 'active' | 'blocked';
};

export type Company = {
  id: string;
  name: string;
  initials: string;
  color: string;
  type: 'Company' | 'Private recruiter';
  field: string;
  city: string;
  address: string;
  plan: 'free' | 'premium';
  status: CompanyStatus;
  licenceNo: string;
  licence: Licence;
  joined: string;
  about: string;
  cover: string;
  photos: string[];
  website: string;
  instagram: string;
  phone: string;
  recruiterIds: string[];
  stats: { posted: number; applicants: string; hires: number; replyTime: string };
  checks?: Check[];
  submitted?: string;
  reports: number;
  log: LogItem[];
};

export type Vacancy = {
  id: string;
  title: string;
  companyId: string;
  postedBy: string;
  field: string;
  pay: string;
  payNote: string;
  contract: string;
  status: VacancyStatus;
  urgent: boolean;
  applicants: number;
  views: string;
  posted: string;
  photos: string[];
  facts: [string, string][];
  description: string;
  flagged?: string;
  requirements: string[];
  conditions: [string, string][];
  checks?: Check[];
  log: LogItem[];
};

export type Report = {
  id: string;
  kind: ReportKind;
  status: ReportStatus;
  reason: string;
  text: string;
  from: { name: string; photo?: string; initials?: string };
  about: { name: string; sub: string; photo?: string; initials?: string; color?: string; link: string };
  age: string;
  chat?: { mine: boolean; text: string; time: string; reported?: boolean }[];
  context?: string;
  prior?: string;
};

/** Hire confirmation after an accepted application: employer "Who did you hire?" + job seeker "Did you get the job?". */
export type EmployerAnswer = 'hired' | 'nofit' | 'deciding' | 'none';
export type SeekerAnswer = 'yes' | 'no' | 'process' | 'other' | 'none';
export type HireResult = 'both' | 'emp' | 'seek' | 'mismatch' | 'wait';
export type Hire = {
  id: string;
  seekerId: string;
  vacancyId: string;
  companyId: string;
  employer: EmployerAnswer;
  seeker: SeekerAnswer;
  /** Job seeker's own words when they picked "Other answer". */
  seekerNote?: string;
  updated: string;
};
export type HireKpi = { key: string; label: string; value: string; delta: string; sub: string };

/** A job seeker with Available today on (24 hours; the app turns it off by itself). */
export type Availability = {
  id: string;
  seekerId: string;
  /** Part of the day they picked: "Evening", "Any time"… */
  when: string;
  /** End time, ms since epoch. Admins see the time left, employers don't. */
  endsAt: number;
  views: number;
  messages: number;
  extended?: boolean;
  reports?: number;
};

export type Metrics = {
  kpis: { key: string; label: string; value: string; delta: string; trend: 'up' | 'down' | 'neutral'; sub: string }[];
  signups: { seekers: number[]; companies: number[]; labels: string[] };
  funnel: { label: string; value: string; share: string; width: number }[];
  fields: [string, number][];
  plans: { free: number; premium: number; max: number; employerPremium: number };
  revenue: { label: string; value: string }[];
  cities: [string, number][];
  /** Hires page KPI row, per period. */
  hires: Record<'7' | '30', HireKpi[]>;
  /** Available today page KPI row. */
  avail: HireKpi[];
};
