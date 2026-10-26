// Domain-specific pieces shared by several pages: status chips, phone section switchers, person/company leads.
import { useLocation, useNavigate } from 'react-router-dom';
import type { Company, CompanyStatus, LicenceStatus, ReportStatus, Seeker, SeekerStatus, VacancyStatus } from '../data/types';
import { useStore } from '../data/store';
import { Avatar, Logo, Segmented, Status, TierBadge, Verified } from './ui';

export function SeekerStatusChip({ s }: { s: SeekerStatus }) {
  if (s === 'active') return <Status kind="success">Active</Status>;
  if (s === 'hidden') return <Status kind="pending" icon="eye-off">Hidden</Status>;
  return <Status kind="danger" icon="lock">Blocked</Status>;
}

export function CompanyStatusChip({ s }: { s: CompanyStatus }) {
  if (s === 'approved') return <Status kind="success" icon="check">Approved</Status>;
  if (s === 'pending') return <Status kind="new" icon="clock">On review</Status>;
  if (s === 'rejected') return <Status kind="attention">Rejected</Status>;
  return <Status kind="danger" icon="lock">Blocked</Status>;
}

export function VacancyStatusChip({ s }: { s: VacancyStatus }) {
  const map: Record<VacancyStatus, [Parameters<typeof Status>[0]['kind'], string]> = {
    live: ['success', 'Live'],
    review: ['new', 'On review'],
    changes: ['attention', 'Changes needed'],
    paused: ['pending', 'Paused'],
    closed: ['closed', 'Closed'],
    rejected: ['danger', 'Rejected'],
  };
  const [kind, label] = map[s];
  return <Status kind={kind}>{label}</Status>;
}

/** Trade licence state = the verified badge in the app. */
export function LicenceChip({ s }: { s: LicenceStatus }) {
  if (s === 'verified') return <Status kind="new" icon="verified">Verified badge</Status>;
  if (s === 'review') return <Status kind="attention" icon="file">Licence on review</Status>;
  if (s === 'rejected') return <Status kind="danger">Licence rejected</Status>;
  return <Status kind="pending">No licence</Status>;
}

export function ReportStatusChip({ s }: { s: ReportStatus }) {
  if (s === 'new') return <Status kind="danger">New</Status>;
  if (s === 'progress') return <Status kind="attention">In progress</Status>;
  return <Status kind="closed">Closed</Status>;
}

export function PersonCell({ p, size = 40 }: { p: Seeker; size?: number }) {
  return (
    <div className="row" style={{ gap: 12 }}>
      <Avatar src={p.photo} size={size} frame={p.tier === 'max' ? p.frame : undefined} />
      <div style={{ minWidth: 0 }}>
        <div className="row" style={{ gap: 6 }}>
          <span className="cell-main">{p.name}</span>
          <TierBadge tier={p.tier} size={16} />
        </div>
        <div className="cell-sub">
          {p.field} · {p.role}
        </div>
      </div>
    </div>
  );
}

export function CompanyCell({ c, size = 40 }: { c: Company; size?: number }) {
  return (
    <div className="row" style={{ gap: 12 }}>
      <Logo initials={c.initials} color={c.color} size={size} />
      <div style={{ minWidth: 0 }}>
        <div className="row" style={{ gap: 6 }}>
          <span className="cell-main">{c.name}</span>
          {c.licence.status === 'verified' && <Verified />}
        </div>
        <div className="cell-sub">
          {c.type} · {c.field}
        </div>
      </div>
    </div>
  );
}

/** Phone-only segmented switch between sibling sections (Users: seekers / companies; Checks: employers / vacancies). */
export function PhoneSwitch({ group }: { group: 'users' | 'checks' }) {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const { counts } = useStore();
  const items =
    group === 'users'
      ? [
          { key: '/seekers', label: 'Job seekers' },
          { key: '/companies', label: 'Companies' },
        ]
      : [
          { key: '/checks/employers', label: 'Employers', count: counts.employers },
          { key: '/checks/vacancies', label: 'Vacancies', count: counts.vacancies },
        ];
  const value = items.find((i) => pathname.startsWith(i.key))?.key ?? items[0].key;
  return (
    <div className="hide-d">
      <Segmented items={items} value={value} onChange={(k) => nav(k)} />
    </div>
  );
}
