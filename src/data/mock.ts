// Mock data for the admin until the API is wired (src/data/api.ts). People photos are the licensed stock set.
import dubai1 from '../assets/img/dubai1.jpg';
import dubai2 from '../assets/img/dubai2.jpg';
import misc from '../assets/img/misc.jpg';
import dj from '../assets/people/f-dj.webp';
import guitarAcoustic from '../assets/people/f-guitar-acoustic.webp';
import guitarElectric from '../assets/people/f-guitar-electric.webp';
import guitarHat from '../assets/people/f-guitar-hat.webp';
import headphones from '../assets/people/f-headphones.webp';
import makeup from '../assets/people/f-makeup.webp';
import photographer from '../assets/people/f-photographer.webp';
import pinkSkirt from '../assets/people/f-pink-skirt.webp';
import videographer from '../assets/people/f-videographer.webp';
import yellowLips from '../assets/people/f-yellow-lips.webp';
import yellowSuit from '../assets/people/f-yellow-suit.webp';
import type { Company, Hire, Metrics, Recruiter, Report, Seeker, Vacancy } from './types';

export const img = { dubai1, dubai2, misc };

type SeekerSeed = [string, string, Seeker['tier'], string, string, string, number, number, string, string, Seeker['status'], 'Female' | 'Male'];
const seeds: SeekerSeed[] = [
  ['s28611', 'Layla Haddad', 'max', 'Hospitality', 'Hostess', 'Dubai', 26, 100, '12 Mar 2026', '2 h ago', 'active', 'Female'],
  ['s50955', 'Nadia Rahimi', 'premium', 'Hospitality', 'Hostess', 'Abu Dhabi', 24, 100, '3 Apr 2026', '5 h ago', 'active', 'Female'],
  ['s32438', 'Karim Aziz', 'max', 'Music', 'DJ', 'Dubai', 29, 95, '28 Feb 2026', 'Today', 'active', 'Male'],
  ['s41861', 'Zara King', 'max', 'Modeling', 'Model', 'Dubai', 23, 90, '9 May 2026', 'Yesterday', 'active', 'Female'],
  ['s79486', 'Leo Park', 'free', 'Service', 'Videographer', 'Abu Dhabi', 31, 60, '14 Oct 2026', '3 d ago', 'active', 'Male'],
  ['s19619', 'Sara Mendes', 'max', 'Hospitality', 'Waitress', 'Dubai', 27, 100, '2 Jan 2026', '1 h ago', 'active', 'Female'],
  ['s31744', 'Olivia Grant', 'premium', 'Hospitality', 'Concierge', 'Dubai', 30, 85, '19 Jun 2026', 'Today', 'active', 'Female'],
  ['s44257', 'Lina Morozova', 'max', 'Music', 'DJ', 'Dubai', 25, 80, '7 Aug 2026', '2 d ago', 'hidden', 'Female'],
  ['s98628', 'Omar Saleh', 'free', 'Music', 'Guitarist', 'Sharjah', 28, 45, '21 Oct 2026', 'Today', 'active', 'Male'],
  ['s98173', 'Ali Rahman', 'free', 'Music', 'Singer', 'Dubai', 26, 70, '30 Jul 2026', '2 w ago', 'blocked', 'Male'],
  ['s35624', 'Yusuf Nasser', 'premium', 'Music', 'Musician', 'Dubai', 33, 75, '11 Sep 2026', '4 d ago', 'active', 'Male'],
];
const photoOf: Record<string, string> = {
  'Layla Haddad': pinkSkirt,
  'Nadia Rahimi': yellowSuit,
  'Karim Aziz': headphones,
  'Zara King': yellowLips,
  'Leo Park': videographer,
  'Sara Mendes': makeup,
  'Olivia Grant': photographer,
  'Lina Morozova': dj,
  'Omar Saleh': guitarElectric,
  'Ali Rahman': guitarHat,
  'Yusuf Nasser': guitarAcoustic,
};
const frames: Record<string, Seeker['frame']> = { 'Layla Haddad': 'neon', 'Karim Aziz': 'gold', 'Zara King': 'gold', 'Sara Mendes': 'ocean', 'Lina Morozova': 'neon' };

export const seekers: Seeker[] = seeds.map(([id, name, tier, field, role, city, age, completeness, joined, lastActive, status, gender], i) => {
  const photo = photoOf[name];
  const first = name.split(' ')[0].toLowerCase();
  const nPhotos = tier === 'free' ? 6 : tier === 'premium' ? 9 : 14;
  return {
    id,
    name,
    photo,
    tier,
    frame: frames[name],
    header: tier === 'max' ? dubai1 : undefined,
    field,
    role,
    city,
    age,
    gender,
    completeness,
    joined,
    lastActive,
    status,
    phone: `+971 5${i % 6} ${String(120 + i * 37).padStart(3, '0')} ${String(4567 + i * 211).slice(-4)}`,
    email: `${first}.${name.split(' ')[1].toLowerCase()}@gmail.com`,
    platform: i % 3 ? 'Android' : 'iOS',
    photos: Array.from({ length: nPhotos }, () => photo),
    videos: [
      { title: 'Video presentation', duration: '0:45', views: '3.4k views · 12 Mar', poster: photo },
      ...(tier === 'free'
        ? []
        : [
            { title: `${role} at work`, duration: '0:32', views: '1.1k views · 2 Aug', poster: photo },
            ...(tier === 'max' ? [{ title: 'Behind the scenes', duration: '0:28', views: '640 views · 20 Oct', poster: photo }] : []),
          ]),
    ],
    about: `${role} with ${3 + (i % 5)} years in UAE ${field.toLowerCase()}: venues in Dubai and Abu Dhabi, private events and brand launches. Reliable, calm with guests, available for evening work and weekends.`,
    languages: [
      ['English', 'Fluent'],
      ['Arabic', i % 2 ? 'Basic' : 'Native'],
      ...(i % 3 === 0 ? [['French', 'Basic'] as [string, string]] : []),
    ],
    details: [
      ['Roles', role],
      ['Height', `${165 + (i % 4) * 4} cm`],
      ['Schedule', i % 2 ? 'Weekends' : 'Evenings, weekends'],
    ],
    experience: [
      { role, place: 'SLS Rooftop Lounge · Dubai', period: 'Jan 2023 — now · 1 yr 10 mos' },
      { role: `${role}, events`, place: 'Atlantis The Palm · Dubai', period: 'Nov 2018 — Dec 2022 · 4 yrs 2 mos' },
    ],
    education: [{ title: 'Diploma, Hospitality management', school: 'Dubai Hospitality College', years: '2016 — 2018' }],
    links: [
      { code: 'WEB', label: 'Portfolio', value: `${first}${name.split(' ')[1].toLowerCase()}.com` },
      { code: 'IG', label: 'Instagram', value: `@${first}.${name.split(' ')[1].toLowerCase()}` },
    ],
    stats: { views: String(1248 - i * 83), applications: String(37 - i * 2), accepted: String(9 - (i % 5)), invites: String(12 - (i % 7)), chats: String(14 - (i % 6)) },
    plan: tier === 'free' ? undefined : { since: '4 Aug 2026', renews: '4 Nov 2026', payment: `Apple Pay · ${tier === 'max' ? '$5.99' : '$2.99'}` },
    reports: name === 'Ali Rahman' ? 2 : 0,
    log: [
      { at: '20 Oct', text: 'Photos re-checked automatically · OK' },
      ...(tier !== 'free' ? [{ at: '4 Aug', text: `Upgraded to ${tier === 'max' ? 'Max' : 'Premium'}` }] : []),
      { at: joined.split(' ').slice(0, 2).join(' '), text: 'Phone verified, profile created' },
    ],
  };
});

export const recruiters: Recruiter[] = [
  { id: 'r55101', name: 'Olivia Grant', photo: photographer, companyId: 'c10422', role: 'Admin', title: 'Event manager', phone: '+971 50 778 2210', email: 'olivia@skyline-hospitality.ae', since: '12 Feb 2026', lastActive: '20 min ago', vacancies: 9, chats: 48, hires: 21, status: 'active' },
  { id: 'r55120', name: 'Sara Mendes', photo: makeup, companyId: 'c10422', role: 'Recruiter', title: 'Talent acquisition lead', phone: '+971 55 230 1189', email: 'sara@skyline-hospitality.ae', since: '3 Mar 2026', lastActive: '1 h ago', vacancies: 4, chats: 31, hires: 12, status: 'active' },
  { id: 'r55133', name: 'Leo Park', photo: videographer, companyId: 'c10422', role: 'Recruiter', title: 'Bar manager', phone: '+971 52 440 9013', email: 'leo@skyline-hospitality.ae', since: '1 Jun 2026', lastActive: '2 d ago', vacancies: 1, chats: 6, hires: 2, status: 'active' },
  { id: 'r55201', name: 'Marco Diaz', photo: guitarHat, companyId: 'c10777', role: 'Admin', title: 'Founder', phone: '+971 55 012 3344', email: 'marco@velocity-events.ae', since: '20 Oct 2026', lastActive: '35 min ago', vacancies: 1, chats: 4, hires: 0, status: 'active' },
  { id: 'r55301', name: 'Olivia Grant', photo: photographer, companyId: 'c10901', role: 'Admin', title: 'Event manager', phone: '+971 50 778 2210', email: 'olivia@prestige-events.ae', since: '23 Oct 2026', lastActive: '2 h ago', vacancies: 0, chats: 0, hires: 0, status: 'active' },
];

const fileOf = (name: string, pages = 2, size = '1.2 MB') => ({ name: `${name.replace(/[^A-Za-z]+/g, '_').replace(/_$/, '')}_trade_licence.pdf`, size, pages });
/** Trade licences: verified ones give the badge in the app; 'review' ones wait in Employer checks. */
const LICENCES: Record<string, Partial<Company['licence']>> = {
  c10422: { status: 'verified', checkedAt: '12 Sep 2026', checkedBy: 'Dana S.' },
  c10311: { status: 'verified', checkedAt: '4 Jan 2026', checkedBy: 'Aibek K.' },
  c10507: { status: 'none' },
  c10120: { status: 'verified', checkedAt: '9 Dec 2025', checkedBy: 'Dana S.' },
  c10901: { status: 'review', sentAt: '2 h ago' },
  c10655: { status: 'review', sentAt: '40 min ago' },
  c10802: { status: 'none' },
  c10777: { status: 'rejected', sentAt: '20 Oct', checkedAt: '20 Oct', checkedBy: 'Aibek K.', reason: 'Licence is unreadable: the photo is cut off and blurry. Upload all pages as a PDF.' },
  c10433: { status: 'review', sentAt: '3 h ago' },
  c10288: { status: 'verified', checkedAt: '3 Jun 2026', checkedBy: 'Dana S.' },
  c10905: { status: 'review', sentAt: '5 h ago' },
  c10906: { status: 'none' },
  c10907: { status: 'review', sentAt: '1 d ago' },
};
const baseLog = (joined: string) => [{ at: joined.split(' ').slice(0, 2).join(' '), text: 'Account created' }];

type CoSeed = [string, string, string, string, Company['type'], string, string, Company['plan'], Company['status'], string, number];
const coSeeds: CoSeed[] = [
  ['c10422', 'Skyline Hospitality', 'SH', '#3589F2', 'Company', 'Hospitality', 'Dubai', 'premium', 'approved', '12 Feb 2026', 41],
  ['c10311', 'DIVES Holding', 'DH', '#0E1A2B', 'Company', 'Events', 'Dubai', 'premium', 'approved', '3 Jan 2026', 66],
  ['c10507', 'ORZU Group', 'OG', '#7A3FD1', 'Company', 'Music', 'Dubai', 'free', 'approved', '27 Mar 2026', 8],
  ['c10120', 'Atlantis The Palm', 'AP', '#00A3A3', 'Company', 'Hospitality', 'Dubai', 'premium', 'approved', '8 Dec 2025', 120],
  ['c10901', 'Prestige Events', 'PE', '#FF8652', 'Company', 'Events', 'Abu Dhabi', 'free', 'pending', '23 Oct 2026', 0],
  ['c10655', 'Azure Beach', 'AB', '#1F6FD9', 'Company', 'F&B', 'Dubai', 'free', 'approved', '4 Jul 2026', 5],
  ['c10802', 'Sam Morris', 'SM', '#5E6670', 'Private recruiter', 'Events', 'Dubai', 'free', 'approved', '19 Sep 2026', 3],
  ['c10777', 'Velocity Events', 'VE', '#E0123F', 'Company', 'Events', 'Dubai', 'free', 'rejected', '20 Oct 2026', 0],
  ['c10433', 'Brew Lab', 'BL', '#8A5A2B', 'Company', 'F&B', 'Dubai', 'premium', 'approved', '15 May 2026', 14],
  ['c10288', 'Coastline Events', 'CE', '#2C2140', 'Company', 'Events', 'Abu Dhabi', 'free', 'blocked', '2 Jun 2026', 2],
  ['c10905', 'Velvet Lounge DIFC', 'VL', '#2A2235', 'Company', 'Hospitality', 'Dubai', 'free', 'pending', '23 Oct 2026', 0],
  ['c10906', 'Ahmed Khalil', 'AK', '#5E6670', 'Private recruiter', 'Hospitality', 'Dubai', 'free', 'pending', '22 Oct 2026', 0],
  ['c10907', 'Nomad Catering', 'NC', '#3A2418', 'Company', 'F&B', 'Sharjah', 'free', 'pending', '22 Oct 2026', 0],
];
export const companies: Company[] = coSeeds.map(([id, name, initials, color, type, field, city, plan, status, joined, hires], i) => ({
  id,
  name,
  initials,
  color,
  type,
  field,
  city,
  address: city === 'Dubai' ? 'Bay Square 7, Business Bay, Dubai' : city === 'Abu Dhabi' ? 'Al Reem Island, Abu Dhabi' : 'Al Majaz, Sharjah',
  plan,
  status,
  licenceNo: type === 'Company' ? `CN-${3318204 + i * 70313}` : 'Private recruiter',
  licence: {
    status: 'none',
    ...LICENCES[id],
    ...(LICENCES[id]?.status && LICENCES[id]?.status !== 'none'
      ? {
          file: fileOf(name, id === 'c10777' ? 1 : 2, id === 'c10777' ? '3.8 MB' : '1.2 MB'),
          issuer: city === 'Abu Dhabi' ? 'Abu Dhabi DED' : city === 'Sharjah' ? 'Sharjah SEDD' : 'Dubai DET',
          activity: field === 'Events' ? 'Event management services' : field === 'F&B' ? 'Restaurant and cafeteria' : field === 'Music' ? 'Entertainment services' : 'Hospitality services',
          validUntil: id === 'c10777' ? '3 Mar 2026' : '14 Mar 2027',
        }
      : {}),
  },
  joined,
  about:
    id === 'c10901'
      ? 'Event agency for brand launches, exhibitions and private parties in Abu Dhabi and Dubai. We hire promoters, hosts and models for 2–3 day projects.'
      : `${name} works in ${field.toLowerCase()} across the UAE. We hire hosts, waiters, performers and event staff for evening shifts and private events, with training provided.`,
  cover: [dubai2, dubai1, misc][i % 3],
  photos: [dubai1, dubai2, misc, dubai1, dubai2].slice(0, status === 'pending' ? 3 : 5),
  website: `${name.toLowerCase().replace(/[^a-z]+/g, '-').replace(/-$/, '')}.ae`,
  instagram: `@${initials.toLowerCase()}.${city === 'Dubai' ? 'dxb' : 'uae'}`,
  phone: `+971 4 ${551 + i} ${7700 + i * 13}`,
  recruiterIds: id === 'c10422' ? ['r55101', 'r55120', 'r55133'] : id === 'c10777' ? ['r55201'] : id === 'c10901' ? ['r55301'] : [],
  stats: { posted: status === 'pending' ? 0 : 28 - (i % 9) * 3, applicants: status === 'pending' ? '0' : `${1942 - i * 140}`, hires, replyTime: `${2 + (i % 4)} h ${10 + i} min` },
  checks:
    status === 'pending'
      ? [
          { level: 'ok', title: 'Licence number format', note: 'Matches the DED pattern' },
          { level: 'ok', title: 'Email domain', note: 'Same as the company website' },
          ...(id === 'c10901' ? [{ level: 'warn' as const, title: 'Similar company exists', note: '“Prestige Event Management” · Dubai · approved 2025' }] : []),
        ]
      : undefined,
  submitted: status === 'pending' ? (id === 'c10901' ? '2 h ago' : id === 'c10905' ? '5 h ago' : '1 d ago') : undefined,
  reports: id === 'c10288' ? 3 : id === 'c10422' ? 1 : 0,
  log: [
    ...(LICENCES[id]?.status === 'verified' ? [{ at: LICENCES[id]!.checkedAt!.split(' ').slice(0, 2).join(' '), text: `Trade licence approved, verified badge on · ${LICENCES[id]!.checkedBy}` }] : []),
    ...(status === 'approved' ? [{ at: '1 Mar', text: 'Account approved by Dana S.' }] : []),
    ...baseLog(joined),
  ],
}));

const V = (v: Partial<Vacancy> & Pick<Vacancy, 'id' | 'title' | 'companyId' | 'field' | 'pay' | 'contract' | 'status'>): Vacancy => ({
  postedBy: 'Sara Mendes',
  payNote: '',
  urgent: false,
  applicants: 0,
  views: '—',
  posted: 'Today',
  photos: [dubai1, dubai2, misc],
  facts: [],
  description: '',
  requirements: [],
  conditions: [],
  log: [],
  ...v,
});
export const vacancies: Vacancy[] = [
  V({
    id: 'v88214',
    title: 'Promo models for a car launch',
    companyId: 'c10777',
    postedBy: 'Marco Diaz',
    field: 'Modeling',
    pay: 'AED 900',
    payNote: '/ day · paid after the event',
    contract: 'One-time',
    status: 'review',
    urgent: true,
    posted: '35 min ago',
    photos: [yellowSuit, dubai2, dubai1],
    facts: [
      ['Contract', 'One-time · 2 days'],
      ['Field', 'Modeling · Promo model'],
      ['Where', 'Expo City, Dubai'],
      ['Dates', '1–2 Nov, 10:00–19:00'],
      ['People', '6 models'],
      ['Gender', 'Female'],
      ['Age', '20–30'],
      ['Applies until', '30 Oct 2026'],
    ],
    description:
      'We are looking for 6 promo models for the launch of a new electric SUV at Expo City. You will welcome guests at the stand, hand out brochures and pose for photos with the car. Two days, 10:00–19:00 with a one-hour break, uniform and make-up provided. Send your photos on WhatsApp +971 55 012 3344 — we answer the same day.',
    flagged: 'Send your photos on WhatsApp +971 55 012 3344',
    requirements: ['Female, 20–30 years', 'Height from 170 cm', 'English; Arabic is a plus', 'Photos in the 919 profile', 'Available both days'],
    conditions: [
      ['Pay', 'AED 900 / day, bank transfer within 7 days'],
      ['Food', 'Lunch provided'],
      ['Transport', 'Shuttle from Expo metro'],
      ['Dress code', 'Uniform provided, own black heels'],
    ],
    checks: [
      { level: 'bad', title: 'Contact details in text', note: 'Phone number in the description: +971 55 012 3344' },
      { level: 'warn', title: 'Company not verified', note: 'Velocity Events was rejected on 20 Oct · licence unreadable' },
      { level: 'ok', title: 'Pay', note: 'AED 900 / day · usual range for promo models' },
      { level: 'ok', title: 'Photos', note: '3 photos, no text or logos of other brands' },
    ],
    log: [
      { at: '10:41', text: 'Sent to review by Marco Diaz' },
      { at: '10:41', text: 'Automatic checks: 1 issue' },
    ],
  }),
  V({
    id: 'v80117',
    title: 'Hostess, rooftop lounge',
    companyId: 'c10422',
    field: 'Hospitality',
    pay: 'AED 15 000',
    payNote: '/ month · monthly contract',
    contract: 'Monthly',
    status: 'live',
    urgent: true,
    applicants: 24,
    views: '3 820',
    posted: '2 Oct',
    facts: [
      ['Contract', 'Monthly'],
      ['Field', 'Hospitality · Hostess'],
      ['Where', 'Business Bay, Dubai'],
      ['Schedule', 'Evenings, 5 days'],
      ['People', '2 hostesses'],
      ['Gender', 'Female'],
      ['Age', '21–32'],
      ['Applies until', '15 Nov 2026'],
    ],
    description:
      'Skyline rooftop lounge in Business Bay is looking for two hostesses for evening shifts, 18:00–02:00, five days a week. You welcome guests, manage the reservation list and seat VIP tables. Training, uniform and transport after midnight are provided.',
    requirements: ['Experience as a hostess from 1 year', 'English; Arabic or Russian is a plus', 'Video presentation in the 919 profile', 'UAE residence visa'],
    conditions: [
      ['Pay', 'AED 15 000 / month + service charge'],
      ['Food', 'Staff meal every shift'],
      ['Transport', 'Taxi after midnight'],
      ['Visa', 'Company visa after probation'],
    ],
    log: [
      { at: '23 Oct', text: 'Urgent turned on · AED 35' },
      { at: '2 Oct', text: 'Approved by Aibek K.' },
      { at: '2 Oct', text: 'Sent to review by Sara Mendes' },
    ],
  }),
  V({ id: 'v88102', title: 'DJ for a boat party', companyId: 'c10507', field: 'Music', pay: 'AED 2 500', payNote: '/ event', contract: 'One-time', status: 'live', urgent: true, applicants: 17, views: '2 140', posted: '20 Oct', photos: [headphones, dubai2, misc] }),
  V({
    id: 'v88220',
    title: 'Waiter, beach club',
    companyId: 'c10655',
    field: 'F&B',
    pay: 'AED 45',
    payNote: '/ hour',
    contract: 'Hourly',
    status: 'review',
    posted: '1 h ago',
    checks: [{ level: 'warn', title: 'Pay below minimum', note: 'AED 45 / hour · usual range from AED 55' }],
    log: [{ at: '09:58', text: 'Sent to review' }],
  }),
  V({ id: 'v87990', title: 'Bartender, pool bar', companyId: 'c10422', field: 'Hospitality', pay: 'AED 9 000', payNote: '/ month', contract: 'Monthly', status: 'live', applicants: 31, views: '4 905', posted: '28 Sep' }),
  V({ id: 'v88001', title: 'Image models, fashion week', companyId: 'c10311', field: 'Modeling', pay: 'AED 1 200', payNote: '/ day', contract: 'Daily', status: 'live', applicants: 58, views: '9 310', posted: '15 Oct', photos: [yellowLips, dubai1, dubai2] }),
  V({ id: 'v87801', title: 'Barista, specialty coffee', companyId: 'c10433', field: 'F&B', pay: 'AED 6 500', payNote: '/ month', contract: 'Monthly', status: 'paused', applicants: 12, views: '1 230', posted: '1 Oct' }),
  V({ id: 'v88150', title: 'Event host, Expo stand', companyId: 'c10901', field: 'Events', pay: 'AED 700', payNote: '/ day', contract: 'Daily', status: 'rejected', posted: '22 Oct' }),
  V({ id: 'v86655', title: 'Night manager', companyId: 'c10422', field: 'Hospitality', pay: 'AED 22 000', payNote: '/ month', contract: 'Monthly', status: 'closed', applicants: 44, views: '6 002', posted: '12 Aug' }),
  V({ id: 'v88177', title: 'Guitarist for a wedding', companyId: 'c10120', field: 'Music', pay: 'AED 3 000', payNote: '/ event', contract: 'One-time', status: 'live', applicants: 9, views: '880', posted: '24 Oct', photos: [guitarAcoustic, dubai1, misc] }),
  V({ id: 'v88230', title: 'Promo hostess, launch event', companyId: 'c10422', field: 'Events', pay: 'AED 900', payNote: '/ day', contract: 'One-time', status: 'changes', posted: 'Yesterday' }),
  V({ id: 'v88231', title: 'Hostess, rooftop lounge (weekends)', companyId: 'c10422', field: 'Hospitality', pay: 'AED 8 000', payNote: '/ month', contract: 'Monthly', status: 'review', posted: '3 h ago' }),
  V({ id: 'v88232', title: 'Barista, specialty coffee bar', companyId: 'c10433', field: 'F&B', pay: 'AED 6 800', payNote: '/ month', contract: 'Monthly', status: 'review', posted: '6 h ago' }),
];

export const reports: Report[] = [
  {
    id: 'R-2291',
    kind: 'message',
    status: 'new',
    reason: 'Scam or asks for money',
    text: '“He asked me to pay 300 dirhams to confirm the job and moved the chat to WhatsApp.”',
    from: { name: 'Layla Haddad', photo: pinkSkirt },
    about: { name: 'Marco Diaz · Velocity Events', sub: 'Asked to move to WhatsApp and pay a “registration fee”', initials: 'VE', color: '#E0123F', link: '/recruiters/r55201' },
    age: '35 min',
    context: 'Chat about “Promo models for a car launch”',
    chat: [
      { mine: false, text: 'Hi Layla! You’re shortlisted for the car launch 🎉', time: '10:02' },
      { mine: true, text: 'Great, what are the next steps?', time: '10:05' },
      { mine: false, text: 'Write me on WhatsApp +971 55 012 3344. To confirm the booking pay AED 300 registration fee, we return it after the event', time: '10:07', reported: true },
    ],
    prior: '2 more reports about Marco Diaz this week, both about payments. Velocity Events was rejected on 20 Oct.',
  },
  {
    id: 'R-2288',
    kind: 'company',
    status: 'new',
    reason: 'Didn’t pay for the work',
    text: '“We worked two days at their stand. They stopped answering when it was time to pay.”',
    from: { name: 'Nadia Rahimi', photo: yellowSuit },
    about: { name: 'Coastline Events', sub: 'Didn’t pay after a 2-day event', initials: 'CE', color: '#2C2140', link: '/companies/c10288' },
    age: '2 h',
    prior: 'Coastline Events was blocked on 2 Jun after 3 similar reports.',
  },
  {
    id: 'R-2285',
    kind: 'person',
    status: 'new',
    reason: 'Fake profile or photos',
    text: '“The photos are taken from someone else’s Instagram, I know the girl in them.”',
    from: { name: 'Sara Mendes', photo: makeup },
    about: { name: 'Ali Rahman', sub: 'Fake photos, taken from someone else’s Instagram', photo: guitarHat, link: '/seekers/s98173' },
    age: '5 h',
  },
  {
    id: 'R-2279',
    kind: 'vacancy',
    status: 'progress',
    reason: 'Pay or conditions are misleading',
    text: '“In the chat they offered half of the pay written in the vacancy.”',
    from: { name: 'Zara King', photo: yellowLips },
    about: { name: 'Promo models for a car launch', sub: 'Pay and conditions don’t match the chat', initials: 'VE', color: '#E0123F', link: '/vacancies/v88214' },
    age: '1 d',
  },
  {
    id: 'R-2276',
    kind: 'message',
    status: 'progress',
    reason: 'Rude or offensive',
    text: '“Insulted me after I declined the application.”',
    from: { name: 'Olivia Grant', photo: photographer },
    about: { name: 'Omar Saleh', sub: 'Rude messages after a declined application', photo: guitarElectric, link: '/seekers/s98628' },
    age: '1 d',
    chat: [
      { mine: true, text: 'Thank you for applying, we chose another candidate this time.', time: '18:20' },
      { mine: false, text: 'You wasted my time, your lounge is a joke', time: '18:24', reported: true },
    ],
  },
  {
    id: 'R-2270',
    kind: 'person',
    status: 'closed',
    reason: 'No-show',
    text: '“Confirmed the trial day and didn’t come.”',
    from: { name: 'Skyline Hospitality', initials: 'SH' },
    about: { name: 'Leo Park', sub: 'No-show on a confirmed trial day', photo: videographer, link: '/seekers/s79486' },
    age: '2 d',
  },
  {
    id: 'R-2262',
    kind: 'message',
    status: 'closed',
    reason: 'Spam',
    text: '“Sent the same message five times in a row.”',
    from: { name: 'Karim Aziz', photo: headphones },
    about: { name: 'Brew Lab recruiter', sub: 'Spam: the same message 5 times', initials: 'BL', color: '#8A5A2B', link: '/companies/c10433' },
    age: '3 d',
  },
  {
    id: 'R-2260',
    kind: 'company',
    status: 'new',
    reason: 'Pretends to be another company',
    text: '“Uses the Atlantis logo but it’s a different agency.”',
    from: { name: 'Yusuf Nasser', photo: guitarAcoustic },
    about: { name: 'Velvet Lounge DIFC', sub: 'Uses another venue’s photos', initials: 'VL', color: '#2A2235', link: '/companies/c10905' },
    age: '3 d',
  },
  {
    id: 'R-2255',
    kind: 'person',
    status: 'progress',
    reason: 'Underage',
    text: '“Says she is 17 in the chat.”',
    from: { name: 'DIVES Holding', initials: 'DH' },
    about: { name: 'Lina Morozova', sub: 'May be under 18', photo: dj, link: '/seekers/s44257' },
    age: '4 d',
  },
];

export const hires: Hire[] = [
  { id: 'h1', seekerId: 's28611', vacancyId: 'v80117', companyId: 'c10422', employer: 'hired', seeker: 'yes', updated: 'Today, 18:42' },
  { id: 'h2', seekerId: 's32438', vacancyId: 'v88102', companyId: 'c10507', employer: 'hired', seeker: 'yes', updated: 'Today, 12:10' },
  { id: 'h3', seekerId: 's50955', vacancyId: 'v80117', companyId: 'c10422', employer: 'deciding', seeker: 'process', updated: 'Today, 18:42' },
  { id: 'h4', seekerId: 's41861', vacancyId: 'v88001', companyId: 'c10311', employer: 'hired', seeker: 'none', updated: 'Yesterday' },
  { id: 'h5', seekerId: 's19619', vacancyId: 'v88220', companyId: 'c10655', employer: 'none', seeker: 'yes', updated: 'Yesterday' },
  { id: 'h6', seekerId: 's98628', vacancyId: 'v88177', companyId: 'c10120', employer: 'nofit', seeker: 'yes', updated: '25 Oct' },
  { id: 'h7', seekerId: 's31744', vacancyId: 'v87801', companyId: 'c10433', employer: 'hired', seeker: 'other', seekerNote: '“Trial week first, contract from November”', updated: '24 Oct' },
  { id: 'h8', seekerId: 's79486', vacancyId: 'v88214', companyId: 'c10777', employer: 'none', seeker: 'none', updated: '23 Oct' },
  { id: 'h9', seekerId: 's44257', vacancyId: 'v88102', companyId: 'c10507', employer: 'hired', seeker: 'no', updated: '22 Oct' },
  { id: 'h10', seekerId: 's35624', vacancyId: 'v88177', companyId: 'c10120', employer: 'deciding', seeker: 'none', updated: '21 Oct' },
];

const signupsSeekers = [410, 452, 398, 520, 610, 575, 540, 480, 505, 590, 640, 700, 688, 612, 560, 598, 655, 720, 801, 760, 690, 705, 770, 842, 815, 760, 790, 860, 905, 880];
export const metrics: Metrics = {
  kpis: [
    { key: 'seekers', label: 'Job seekers', value: '18 402', delta: '+6.2%', trend: 'up', sub: 'vs last 30 days' },
    { key: 'companies', label: 'Companies', value: '1 284', delta: '+3.1%', trend: 'up', sub: '92 private recruiters' },
    { key: 'vacancies', label: 'Live vacancies', value: '3 917', delta: '+11%', trend: 'up', sub: '412 urgent' },
    { key: 'applications', label: 'Applied today', value: '2 341', delta: '−4%', trend: 'down', sub: 'avg 7.4 per vacancy' },
    { key: 'paid', label: 'Paid plans', value: '1 106', delta: '+18%', trend: 'up', sub: '$4.9k MRR' },
    { key: 'queue', label: 'To review', value: '11', delta: '4 employers', trend: 'neutral', sub: 'oldest 5 h' },
  ],
  signups: {
    seekers: signupsSeekers,
    companies: [28, 31, 26, 35, 40, 38, 33, 29, 31, 37, 42, 45, 44, 39, 36, 40, 43, 47, 52, 49, 45, 47, 50, 55, 53, 49, 51, 56, 60, 58],
    labels: ['24 Sep', '1 Oct', '8 Oct', '15 Oct', '23 Oct'],
  },
  funnel: [
    { label: 'Vacancy views', value: '184 210', share: '100%', width: 100 },
    { label: 'Applications', value: '27 640', share: '15%', width: 62 },
    { label: 'Accepted', value: '6 980', share: '25%', width: 34 },
    { label: 'Hired', value: '2 115', share: '30%', width: 18 },
  ],
  fields: [
    ['Hospitality', 6120],
    ['Events', 3410],
    ['Modeling', 2980],
    ['Music', 2210],
    ['F&B', 1950],
    ['Beauty', 980],
    ['Service', 752],
  ],
  plans: { free: 17296, premium: 764, max: 342, employerPremium: 214 },
  hires: {
    '30': [
      { key: 'confirmed', label: 'Confirmed hires', value: '214', delta: '+22%', sub: 'both said “hired”' },
      { key: 'employer', label: 'Employer: hired', value: '268', delta: '+15%', sub: 'of 862 accepted' },
      { key: 'seeker', label: 'Job seeker: got it', value: '241', delta: '+18%', sub: 'of 862 accepted' },
      { key: 'answered', label: 'Answer rate', value: '63% · 48%', delta: '+5 pts', sub: 'employers · job seekers' },
      { key: 'conversion', label: 'Accepted → hired', value: '31%', delta: '+3 pts', sub: 'confirmed by both' },
    ],
    '7': [
      { key: 'confirmed', label: 'Confirmed hires', value: '58', delta: '+9%', sub: 'both said “hired”' },
      { key: 'employer', label: 'Employer: hired', value: '71', delta: '+6%', sub: 'of 214 accepted' },
      { key: 'seeker', label: 'Job seeker: got it', value: '64', delta: '+11%', sub: 'of 214 accepted' },
      { key: 'answered', label: 'Answer rate', value: '61% · 45%', delta: '+2 pts', sub: 'employers · job seekers' },
      { key: 'conversion', label: 'Accepted → hired', value: '27%', delta: '+1 pt', sub: 'confirmed by both' },
    ],
  },
  revenue: [
    { label: 'Seeker Premium', value: '$2.3k' },
    { label: 'Seeker Max', value: '$2.0k' },
    { label: 'Employer Premium', value: '$0.9k' },
    { label: 'Urgent boosts', value: 'AED 14.4k' },
  ],
  cities: [
    ['Dubai', 11240],
    ['Abu Dhabi', 4120],
    ['Sharjah', 1980],
    ['Other', 1062],
  ],
};
