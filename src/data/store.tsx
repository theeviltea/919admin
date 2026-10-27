// Admin state: entities + moderation actions. Every action updates the UI at once, writes to the admin log,
// calls the API (no-op in mock mode) and shows a toast; destructive actions can be undone from the toast.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { API_URL, api, type AdminAction, type Entity } from './api';
import { companies, hires, metrics, recruiters, reports, seekers, vacancies } from './mock';
import type { Company, Hire, CompanyStatus, Recruiter, Report, ReportStatus, Seeker, SeekerStatus, Vacancy, VacancyStatus } from './types';

type State = { seekers: Seeker[]; companies: Company[]; recruiters: Recruiter[]; vacancies: Vacancy[]; reports: Report[]; hires: Hire[]; metrics: typeof metrics };
type Toast = { id: number; text: string; undo?: () => void };

const ME = 'Aibek K.';
const now = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

function useStoreValue() {
  const [state, setState] = useState<State>({ seekers, companies, recruiters, vacancies, reports, hires, metrics });
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<number>();

  useEffect(() => {
    if (!API_URL) return;
    api.bootstrap().then(setState).catch((e) => console.error(e));
  }, []);

  const notify = useCallback((text: string, undo?: () => void) => {
    window.clearTimeout(timer.current);
    setToast({ id: Date.now(), text, undo });
    timer.current = window.setTimeout(() => setToast(null), 5000);
  }, []);

  /** Apply a change, send it to the API, toast; `undoable` keeps a snapshot for the toast's Undo. */
  const run = useCallback(
    (entity: Entity, id: string, action: AdminAction, change: (s: State) => State, text: string, body?: Record<string, unknown>, undoable = false) => {
      let before: State | undefined;
      setState((s) => {
        before = s;
        return change(s);
      });
      api.act(entity, id, action, body).catch((e) => {
        console.error(e);
        if (before) setState(before);
        notify('Couldn’t save the change. Check the connection and try again.');
      });
      notify(text, undoable ? () => before && setState(before) : undefined);
    },
    [notify],
  );

  const log = (text: string, note?: string) => ({ at: now(), text: `${text} by ${ME}${note ? ` · “${note}”` : ''}` });

  const seeker = useCallback(
    (id: string, action: 'hide' | 'show' | 'block' | 'unblock' | 'request-changes' | 'delete' | 'warn', note?: string) => {
      const name = state.seekers.find((x) => x.id === id)?.name ?? 'Profile';
      const status: Record<string, SeekerStatus> = { hide: 'hidden', show: 'active', block: 'blocked', unblock: 'active' };
      const labels: Record<string, [string, string]> = {
        hide: ['Hidden from employers', `${name} is hidden from employers`],
        show: ['Shown to employers again', `${name} is visible to employers again`],
        block: ['Blocked', `${name} is blocked`],
        unblock: ['Unblocked', `${name} is unblocked`],
        'request-changes': ['Changes requested', `Request sent to ${name}`],
        warn: ['Warning sent', `Warning sent to ${name}`],
        delete: ['Deleted', `${name}’s profile deleted`],
      };
      const [logText, toastText] = labels[action];
      run(
        'seekers',
        id,
        action,
        (s) => ({
          ...s,
          seekers:
            action === 'delete'
              ? s.seekers.filter((x) => x.id !== id)
              : s.seekers.map((x) => (x.id === id ? { ...x, status: status[action] ?? x.status, log: [log(logText, note), ...x.log] } : x)),
        }),
        toastText,
        { note },
        action !== 'request-changes' && action !== 'warn',
      );
    },
    [run, state.seekers],
  );

  const company = useCallback(
    (id: string, action: 'approve' | 'reject' | 'request-changes' | 'block' | 'unblock' | 'delete', note?: string) => {
      const name = state.companies.find((x) => x.id === id)?.name ?? 'Company';
      const status: Record<string, CompanyStatus> = { approve: 'approved', reject: 'rejected', block: 'blocked', unblock: 'approved' };
      const labels: Record<string, [string, string]> = {
        approve: ['Account approved', `${name} is approved and can post vacancies`],
        reject: ['Rejected', `${name} rejected, the employer got the reason`],
        'request-changes': ['Changes requested', `Request sent to ${name}`],
        block: ['Blocked', `${name} is blocked, its vacancies are hidden`],
        unblock: ['Unblocked', `${name} is unblocked`],
        delete: ['Deleted', `${name} and its vacancies deleted`],
      };
      const [logText, toastText] = labels[action];
      run(
        'companies',
        id,
        action,
        (s) => {
          if (action === 'delete')
            return {
              ...s,
              companies: s.companies.filter((x) => x.id !== id),
              vacancies: s.vacancies.filter((v) => v.companyId !== id),
              recruiters: s.recruiters.filter((r) => r.companyId !== id),
            };
          return {
            ...s,
            companies: s.companies.map((x) => (x.id === id ? { ...x, status: status[action] ?? x.status, log: [log(logText, note), ...x.log] } : x)),
            vacancies:
              action === 'block'
                ? s.vacancies.map((v) => (v.companyId === id && v.status === 'live' ? { ...v, status: 'paused' as const } : v))
                : s.vacancies,
          };
        },
        toastText,
        { note },
        action !== 'request-changes',
      );
    },
    [run, state.companies],
  );

  /** Trade licence decision: approve gives the verified badge in the app, reject sends the reason to the employer. */
  const licence = useCallback(
    (id: string, action: 'approve' | 'reject', note?: string) => {
      const name = state.companies.find((x) => x.id === id)?.name ?? 'Company';
      run(
        'companies',
        id,
        action === 'approve' ? 'approve-licence' : 'reject-licence',
        (s) => ({
          ...s,
          companies: s.companies.map((x) =>
            x.id === id
              ? {
                  ...x,
                  licence: { ...x.licence, status: action === 'approve' ? 'verified' : 'rejected', checkedAt: 'Today', checkedBy: ME, reason: action === 'reject' ? note : undefined },
                  log: [log(action === 'approve' ? 'Trade licence approved, verified badge on' : 'Trade licence rejected', note), ...x.log],
                }
              : x,
          ),
        }),
        action === 'approve' ? `${name} got the verified badge` : `Licence rejected, ${name} got the reason`,
        { note },
        true,
      );
    },
    [run, state.companies],
  );

  const recruiter = useCallback(
    (id: string, action: 'block' | 'unblock' | 'delete') => {
      const name = state.recruiters.find((x) => x.id === id)?.name ?? 'Recruiter';
      run(
        'recruiters',
        id,
        action,
        (s) => ({
          ...s,
          recruiters:
            action === 'delete'
              ? s.recruiters.filter((x) => x.id !== id)
              : s.recruiters.map((x) => (x.id === id ? { ...x, status: action === 'block' ? 'blocked' : 'active' } : x)),
        }),
        action === 'delete' ? `${name} removed from the company` : action === 'block' ? `${name} is blocked` : `${name} is unblocked`,
        undefined,
        true,
      );
    },
    [run, state.recruiters],
  );

  const vacancy = useCallback(
    (id: string, action: 'approve' | 'reject' | 'request-changes' | 'pause' | 'resume' | 'close' | 'delete' | 'edit', note?: string, patch?: Partial<Vacancy>) => {
      const title = state.vacancies.find((x) => x.id === id)?.title ?? 'Vacancy';
      const status: Record<string, VacancyStatus> = { approve: 'live', reject: 'rejected', 'request-changes': 'changes', pause: 'paused', resume: 'live', close: 'closed' };
      const labels: Record<string, [string, string]> = {
        approve: ['Approved', `“${title}” is live`],
        reject: ['Rejected', `“${title}” rejected, the employer got the reason`],
        'request-changes': ['Changes requested', `“${title}” sent back for changes`],
        pause: ['Paused', `“${title}” is paused`],
        resume: ['Published again', `“${title}” is live again`],
        close: ['Closed', `“${title}” is closed`],
        edit: ['Edited', `“${title}” saved`],
        delete: ['Deleted', `“${title}” deleted`],
      };
      const [logText, toastText] = labels[action];
      run(
        'vacancies',
        id,
        action,
        (s) => ({
          ...s,
          vacancies:
            action === 'delete'
              ? s.vacancies.filter((x) => x.id !== id)
              : s.vacancies.map((x) =>
                  x.id === id
                    ? {
                        ...x,
                        ...patch,
                        ...(action === 'edit' && x.flagged && !(patch?.description ?? x.description).includes(x.flagged)
                          ? { flagged: undefined, checks: x.checks?.map((c) => (c.level === 'bad' ? { ...c, level: 'ok' as const, note: 'Removed by an admin' } : c)) }
                          : {}),
                        status: status[action] ?? x.status,
                        log: [log(logText, note), ...x.log],
                      }
                    : x,
                ),
        }),
        toastText,
        { note, patch },
        action !== 'request-changes' && action !== 'edit',
      );
    },
    [run, state.vacancies],
  );

  const report = useCallback(
    (id: string, status: ReportStatus, text: string) => {
      run('reports', id, status === 'progress' ? 'take' : 'resolve', (s) => ({ ...s, reports: s.reports.map((r) => (r.id === id ? { ...r, status } : r)) }), text, undefined, true);
    },
    [run],
  );

  const edit = useCallback(
    (entity: 'seekers' | 'companies', id: string, patch: Partial<Seeker> & Partial<Company>) => {
      run(
        entity,
        id,
        'edit',
        (s) =>
          entity === 'seekers'
            ? { ...s, seekers: s.seekers.map((x) => (x.id === id ? { ...x, ...(patch as Partial<Seeker>), log: [log('Edited'), ...x.log] } : x)) }
            : { ...s, companies: s.companies.map((x) => (x.id === id ? { ...x, ...(patch as Partial<Company>), log: [log('Edited'), ...x.log] } : x)) },
        'Changes saved, the author was notified',
        { patch },
      );
    },
    [run],
  );

  const counts = useMemo(
    () => ({
      employers: state.companies.filter((c) => c.status === 'pending' || c.licence.status === 'review').length,
      newCompanies: state.companies.filter((c) => c.status === 'pending').length,
      licences: state.companies.filter((c) => c.licence.status === 'review').length,
      vacancies: state.vacancies.filter((v) => v.status === 'review').length,
      reports: state.reports.filter((r) => r.status === 'new').length,
    }),
    [state],
  );

  return { ...state, counts, toast, dismissToast: () => setToast(null), notify, act: { seeker, company, licence, recruiter, vacancy, report, edit } };
}

type Store = ReturnType<typeof useStoreValue>;
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue();
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore outside StoreProvider');
  return v;
}
