// Hires: confirmations after an accepted application — employer "Who did you hire?" and job seeker "Did you get the job?".
import { useMemo, useState } from 'react';
import { DataTable } from '../components/table';
import { Avatar, Button, Icon, Logo, PageHead, Segmented, Status, type IconName, type StatusKind } from '../components/ui';
import { Link } from '../lib/links';
import { useStore } from '../data/store';
import type { EmployerAnswer, Hire, HireResult, SeekerAnswer } from '../data/types';

const EMP: Record<EmployerAnswer, [StatusKind, string, IconName | undefined]> = {
  hired: ['success', 'Hired', 'check'],
  nofit: ['danger', 'Not a fit', 'cancel'],
  deciding: ['attention', 'Still deciding', 'clock'],
  none: ['pending', 'No answer', undefined],
};
const SEEK: Record<SeekerAnswer, [StatusKind, string, IconName | undefined]> = {
  yes: ['success', 'Got the job', 'check'],
  no: ['danger', 'Didn’t work out', 'cancel'],
  process: ['attention', 'In process', 'clock'],
  other: ['pending', 'Other answer', undefined],
  none: ['pending', 'No answer', undefined],
};
const RESULT: Record<HireResult, [StatusKind, string, IconName | undefined]> = {
  both: ['success', 'Confirmed hire', 'check-double'],
  emp: ['new', 'Only employer', undefined],
  seek: ['new', 'Only job seeker', undefined],
  mismatch: ['danger', 'Mismatch', 'alert-circle'],
  wait: ['pending', 'Waiting', undefined],
};
const KPI_ICONS: Record<string, IconName> = { confirmed: 'check-double', employer: 'building', seeker: 'users', answered: 'message', conversion: 'flash' };

/** A hire counts when both sides confirm; one positive and one negative answer is a mismatch. */
export function hireResult(h: Pick<Hire, 'employer' | 'seeker'>): HireResult {
  const seekerYes = h.seeker === 'yes' || h.seeker === 'other';
  if (h.employer === 'hired' && seekerYes) return 'both';
  if ((h.employer === 'hired' && h.seeker === 'no') || (h.employer === 'nofit' && h.seeker === 'yes')) return 'mismatch';
  if (h.employer === 'hired' && h.seeker === 'none') return 'emp';
  if (h.seeker === 'yes' && h.employer === 'none') return 'seek';
  return 'wait';
}

function Chip3({ v }: { v: [StatusKind, string, IconName | undefined] }) {
  return (
    <Status kind={v[0]} icon={v[2]}>
      {v[1]}
    </Status>
  );
}

function SeekerAnswerCell({ h }: { h: Hire }) {
  return (
    <div>
      <Chip3 v={SEEK[h.seeker]} />
      {h.seeker === 'other' && h.seekerNote ? <div className="small muted" style={{ marginTop: 4, lineHeight: 1.35 }}>{h.seekerNote}</div> : null}
    </div>
  );
}

type Tab = 'all' | HireResult;
const TABS: [Tab, string][] = [
  ['all', 'All'],
  ['both', 'Confirmed by both'],
  ['emp', 'Only employer'],
  ['seek', 'Only job seeker'],
  ['mismatch', 'Mismatch'],
  ['wait', 'Waiting'],
];

export default function Hires() {
  const { hires, seekers, vacancies, companies, metrics, notify } = useStore();
  const [range, setRange] = useState<'7' | '30'>('30');
  const [tab, setTab] = useState<Tab>('all');
  const rows = useMemo(
    () =>
      hires
        .map((h) => ({ ...h, result: hireResult(h), p: seekers.find((s) => s.id === h.seekerId), v: vacancies.find((v) => v.id === h.vacancyId), c: companies.find((c) => c.id === h.companyId) }))
        .filter((r) => r.p),
    [hires, seekers, vacancies, companies],
  );
  const shown = rows.filter((r) => tab === 'all' || r.result === tab);
  const count = (t: Tab) => rows.filter((r) => t === 'all' || r.result === t).length;

  return (
    <>
      <PageHead
        title="Hires"
        sub={`Hire confirmations from employers and job seekers · last ${range} days`}
        right={
          <div className="row" style={{ gap: 8 }}>
            <Segmented
              items={[
                { key: '7', label: '7 days' },
                { key: '30', label: '30 days' },
              ]}
              value={range}
              onChange={setRange}
            />
            <Button kind="secondary" icon="download" onClick={() => notify('CSV export starts when the backend is connected')}>
              Export CSV
            </Button>
          </div>
        }
      />
      <div className="kpis hires-kpis">
        {metrics.hires[range].map((k) => (
          <div key={k.key} className="kpi">
            <span className="row" style={{ gap: 8 }}>
              <span className="check-ic" style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--primary-secondary)', color: 'var(--primary)' }}>
                <Icon name={KPI_ICONS[k.key] ?? 'grid'} size={18} />
              </span>
              <span className="small muted" style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {k.label}
              </span>
            </span>
            <span className="kpi-v">{k.value}</span>
            <span className="row wrap" style={{ gap: 6 }}>
              <span className="status st-success" style={{ height: 22 }}>
                {k.delta}
              </span>
              <span className="small muted">{k.sub}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="row" style={{ gap: 10, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 16, background: 'var(--primary-secondary)', fontSize: 14, lineHeight: 1.45 }}>
        <span style={{ color: 'var(--link)', display: 'flex' }}>
          <Icon name="check-double" />
        </span>
        <span>
          After a candidate is accepted, both sides get a push and a sheet: the employer marks <b>Hired / Not a fit / Still deciding</b>, the job seeker answers{' '}
          <b>Got the job / Didn’t work out / In process / Other</b>. A hire counts when both confirm.
        </span>
      </div>
      <Segmented items={TABS.map(([key, label]) => ({ key, label, count: count(key) }))} value={tab} onChange={setTab} />
      <DataTable
        rows={shown}
        href={(r) => `/seekers/${r.seekerId}`}
        emptyTitle="Nothing here yet"
        emptyText="Answers appear here as employers and job seekers reply."
        columns={[
          {
            label: 'Candidate',
            render: (r) => (
              <div className="row" style={{ gap: 10 }}>
                <Avatar src={r.p!.photo} size={40} />
                <div style={{ minWidth: 0 }}>
                  <div className="cell-main">{r.p!.name}</div>
                  <div className="cell-sub">
                    {r.p!.role} · {r.p!.city}
                  </div>
                </div>
              </div>
            ),
          },
          {
            label: 'Vacancy',
            render: (r) =>
              r.v ? (
                <span onClick={(e) => e.stopPropagation()} style={{ display: 'block' }}>
                  <Link to={`/vacancies/${r.v.id}`} className="row" style={{ gap: 10, textDecoration: 'none' }}>
                    {r.c ? <Logo initials={r.c.initials} color={r.c.color} size={32} radius={10} /> : null}
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.v.title}</span>
                      <span className="cell-sub" style={{ display: 'block' }}>
                        {r.c?.name}
                      </span>
                    </span>
                  </Link>
                </span>
              ) : (
                '—'
              ),
          },
          { label: 'Employer', render: (r) => <Chip3 v={EMP[r.employer]} /> },
          { label: 'Job seeker', render: (r) => <SeekerAnswerCell h={r} /> },
          { label: 'Result', render: (r) => <Chip3 v={RESULT[r.result]} /> },
          { label: 'Updated', render: (r) => <span className="small muted">{r.updated}</span> },
        ]}
        mobile={(r) => (
          <div className="col" style={{ gap: 10, width: '100%' }}>
            <div className="row" style={{ gap: 10 }}>
              <Avatar src={r.p!.photo} size={40} />
              <div className="grow">
                <div className="cell-main">{r.p!.name}</div>
                <div className="cell-sub" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.v?.title} · {r.c?.name}
                </div>
              </div>
              <Chip3 v={RESULT[r.result]} />
            </div>
            <div className="two" style={{ gap: 8, gridTemplateColumns: '1fr 1fr' }}>
              <div style={{ borderRadius: 14, background: 'var(--back)', padding: 10 }}>
                <div className="small muted" style={{ marginBottom: 6 }}>
                  Employer
                </div>
                <Chip3 v={EMP[r.employer]} />
              </div>
              <div style={{ borderRadius: 14, background: 'var(--back)', padding: 10, minWidth: 0 }}>
                <div className="small muted" style={{ marginBottom: 6 }}>
                  Job seeker
                </div>
                <SeekerAnswerCell h={r} />
              </div>
            </div>
          </div>
        )}
      />
    </>
  );
}
