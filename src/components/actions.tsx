// Management actions with their confirmation dialogs. Pages call these instead of the store directly.
import { useNavigate } from 'react-router-dom';
import { useStore } from '../data/store';
import type { Company, Recruiter, Seeker, Vacancy } from '../data/types';
import { useDialogs } from './dialogs';

const PROFILE_REASONS = ['Fake profile or photos', 'Scam or asks for money', 'Rude or offensive behaviour', 'Under 18', 'Other'];
const VACANCY_REJECT = ['Contact details in the text', 'Scam or asks for money', 'Pay or conditions are misleading', 'Not a real job', 'Prohibited work', 'Duplicate vacancy'];
const COMPANY_REJECT = ['Licence unreadable or expired', 'Company data doesn’t match the licence', 'Copies another company', 'Not a real business', 'Other'];

export function useSeekerActions() {
  const { act } = useStore();
  const { ask, edit } = useDialogs();
  const nav = useNavigate();
  return {
    edit: (p: Seeker) =>
      edit({
        title: `Edit ${p.name}`,
        fields: [
          { key: 'role', label: 'Role', value: p.role },
          { key: 'city', label: 'City', value: p.city },
          { key: 'about', label: 'About', value: p.about, multiline: true },
        ],
        onSave: (v) => act.edit('seekers', p.id, { role: v.role, city: v.city, about: v.about }),
      }),
    requestChanges: (p: Seeker) =>
      ask({
        title: `Ask ${p.name.split(' ')[0]} to fix the profile`,
        text: 'She gets a notification and a message from 919 Support with your note. The profile stays visible.',
        icon: 'message',
        tone: 'attention',
        note: { label: 'What to fix', placeholder: 'For example: replace the second photo, it shows another person', required: true },
        confirm: 'Send request',
        onConfirm: ({ note }) => act.seeker(p.id, 'request-changes', note),
      }),
    hide: (p: Seeker) =>
      p.status === 'hidden'
        ? act.seeker(p.id, 'show')
        : ask({
            title: `Hide ${p.name}?`,
            text: 'Employers won’t see the profile in Talents and search. Chats stay open, the person can still apply.',
            icon: 'eye-off',
            tone: 'attention',
            confirm: 'Hide profile',
            onConfirm: () => act.seeker(p.id, 'hide'),
          }),
    block: (p: Seeker) =>
      p.status === 'blocked'
        ? act.seeker(p.id, 'unblock')
        : ask({
            title: `Block ${p.name}?`,
            text: 'The person can’t sign in, apply or write to employers. All applications are withdrawn.',
            icon: 'lock',
            tone: 'danger',
            reasons: PROFILE_REASONS,
            confirm: 'Block',
            onConfirm: ({ reason }) => act.seeker(p.id, 'block', reason),
          }),
    remove: (p: Seeker, after?: string) =>
      ask({
        title: `Delete ${p.name}’s profile?`,
        text: 'Photos, videos, applications and chats are deleted for good. The phone number can sign up again.',
        icon: 'trash',
        tone: 'danger',
        reasons: PROFILE_REASONS,
        confirm: 'Delete profile',
        onConfirm: ({ reason }) => {
          act.seeker(p.id, 'delete', reason);
          if (after) nav(after);
        },
      }),
    bulk: (ids: string[], action: 'hide' | 'block' | 'delete', clear: () => void) =>
      ask({
        title: `${action === 'delete' ? 'Delete' : action === 'block' ? 'Block' : 'Hide'} ${ids.length} profiles?`,
        icon: action === 'delete' ? 'trash' : action === 'block' ? 'lock' : 'eye-off',
        tone: action === 'hide' ? 'attention' : 'danger',
        reasons: action === 'hide' ? undefined : PROFILE_REASONS,
        confirm: action === 'delete' ? 'Delete' : action === 'block' ? 'Block' : 'Hide',
        onConfirm: ({ reason }) => {
          ids.forEach((id) => act.seeker(id, action, reason));
          clear();
        },
      }),
  };
}

export function useCompanyActions() {
  const { act } = useStore();
  const { ask, edit } = useDialogs();
  const nav = useNavigate();
  return {
    approve: (c: Company, after?: string) =>
      ask({
        title: `Verify ${c.name}?`,
        text: 'The company gets the verified badge and can publish vacancies. Its recruiters can start chats.',
        icon: 'verified',
        tone: 'success',
        confirm: 'Verify company',
        onConfirm: () => {
          act.company(c.id, 'approve');
          if (after) nav(after);
        },
      }),
    reject: (c: Company, after?: string) =>
      ask({
        title: `Reject ${c.name}?`,
        text: 'The employer sees the reason and your note, and can send the data again.',
        icon: 'cancel',
        tone: 'danger',
        reasons: COMPANY_REJECT,
        note: { label: 'Note for the employer (optional)', placeholder: 'For example: the licence photo is cut off, upload all pages' },
        confirm: 'Reject',
        onConfirm: ({ reason, note }) => {
          act.company(c.id, 'reject', [reason, note].filter(Boolean).join(' · '));
          if (after) nav(after);
        },
      }),
    requestChanges: (c: Company) =>
      ask({
        title: `Ask ${c.name} for changes`,
        text: 'The employer gets a notification. The profile stays as it is until they send it again.',
        icon: 'message',
        tone: 'attention',
        note: { label: 'What to change', placeholder: 'For example: upload the licence page with the activity list', required: true },
        confirm: 'Send request',
        onConfirm: ({ note }) => act.company(c.id, 'request-changes', note),
      }),
    edit: (c: Company) =>
      edit({
        title: `Edit ${c.name}`,
        fields: [
          { key: 'name', label: 'Company name', value: c.name },
          { key: 'address', label: 'Address', value: c.address },
          { key: 'about', label: 'About the company', value: c.about, multiline: true },
        ],
        onSave: (v) => act.edit('companies', c.id, { name: v.name, address: v.address, about: v.about }),
      }),
    block: (c: Company) =>
      c.status === 'blocked'
        ? act.company(c.id, 'unblock')
        : ask({
            title: `Block ${c.name}?`,
            text: 'Recruiters can’t sign in, live vacancies are paused and hidden. Job seekers see a warning in existing chats.',
            icon: 'lock',
            tone: 'danger',
            reasons: ['Didn’t pay for the work', 'Scam or asks for money', 'Pretends to be another company', 'Repeated rule violations', 'Other'],
            confirm: 'Block company',
            onConfirm: ({ reason }) => act.company(c.id, 'block', reason),
          }),
    remove: (c: Company, after = '/companies') =>
      ask({
        title: `Delete ${c.name}?`,
        text: `The company, its ${c.recruiterIds.length || 'recruiter'} recruiter accounts and all ${c.stats.posted} vacancies are deleted for good. Job seekers keep their chats in read-only mode.`,
        icon: 'trash',
        tone: 'danger',
        typeToConfirm: c.name,
        confirm: 'Delete company',
        onConfirm: () => {
          act.company(c.id, 'delete');
          nav(after);
        },
      }),
  };
}

export function useRecruiterActions() {
  const { act } = useStore();
  const { ask } = useDialogs();
  const nav = useNavigate();
  return {
    block: (r: Recruiter) =>
      r.status === 'blocked'
        ? act.recruiter(r.id, 'unblock')
        : ask({
            title: `Block ${r.name}?`,
            text: 'Only this recruiter loses access. The company and its other recruiters keep working.',
            icon: 'lock',
            tone: 'danger',
            reasons: ['Scam or asks for money', 'Rude or offensive behaviour', 'Moves chats to other apps', 'Other'],
            confirm: 'Block recruiter',
            onConfirm: () => act.recruiter(r.id, 'block'),
          }),
    remove: (r: Recruiter, after: string) =>
      ask({
        title: `Remove ${r.name} from the company?`,
        text: 'Their vacancies move to the company admin. Chats stay with the company.',
        icon: 'trash',
        tone: 'danger',
        confirm: 'Remove',
        onConfirm: () => {
          act.recruiter(r.id, 'delete');
          nav(after);
        },
      }),
  };
}

export function useVacancyActions() {
  const { act } = useStore();
  const { ask, edit } = useDialogs();
  const nav = useNavigate();
  return {
    approve: (v: Vacancy, after?: string) => {
      act.vacancy(v.id, 'approve');
      if (after) nav(after);
    },
    requestChanges: (v: Vacancy, after?: string) =>
      ask({
        title: 'Send back for changes',
        text: 'The vacancy goes back to the employer with your note. It isn’t visible until they fix it and send it again.',
        icon: 'message',
        tone: 'attention',
        reasons: ['Remove contact details from the text', 'Pay is unclear or too low', 'Photos don’t match the job', 'Fill in the requirements'],
        note: { label: 'Note for the employer', placeholder: 'For example: candidates write to you in 919 chat, remove the WhatsApp number' },
        confirm: 'Send back',
        onConfirm: ({ reason, note }) => {
          act.vacancy(v.id, 'request-changes', [reason, note].filter(Boolean).join(' · '));
          if (after) nav(after);
        },
      }),
    reject: (v: Vacancy, after?: string) =>
      ask({
        title: 'Reject the vacancy?',
        text: 'The employer sees the reason. A rejected vacancy can’t be sent again, only re-created.',
        icon: 'cancel',
        tone: 'danger',
        reasons: VACANCY_REJECT,
        note: { label: 'Note for the employer (optional)' },
        confirm: 'Reject',
        onConfirm: ({ reason, note }) => {
          act.vacancy(v.id, 'reject', [reason, note].filter(Boolean).join(' · '));
          if (after) nav(after);
        },
      }),
    edit: (v: Vacancy) =>
      edit({
        title: 'Edit vacancy',
        fields: [
          { key: 'title', label: 'Title', value: v.title },
          { key: 'pay', label: 'Pay', value: v.pay },
          { key: 'description', label: 'Description', value: v.flagged ? v.description.replace(v.flagged, '').replace(/\s+—\s*$|\s{2,}/g, ' ').trim() : v.description, multiline: true },
        ],
        onSave: (val) => act.vacancy(v.id, 'edit', undefined, { title: val.title, pay: val.pay, description: val.description }),
      }),
    pause: (v: Vacancy) => act.vacancy(v.id, v.status === 'paused' ? 'resume' : 'pause'),
    close: (v: Vacancy) =>
      ask({
        title: 'Close the vacancy?',
        text: 'It disappears from search. Applicants get a notification that hiring is over.',
        icon: 'lock',
        tone: 'attention',
        confirm: 'Close vacancy',
        onConfirm: () => act.vacancy(v.id, 'close'),
      }),
    remove: (v: Vacancy, after = '/vacancies') =>
      ask({
        title: `Delete “${v.title}”?`,
        text: `The vacancy, its ${v.applicants} applications and photos are deleted for good.`,
        icon: 'trash',
        tone: 'danger',
        reasons: VACANCY_REJECT,
        confirm: 'Delete vacancy',
        onConfirm: ({ reason }) => {
          act.vacancy(v.id, 'delete', reason);
          nav(after);
        },
      }),
  };
}
