// Directory lists: job seekers, companies, vacancies.
import { useMemo, useState } from 'react';
import { useSeekerActions } from '../components/actions';
import { CompanyCell, CompanyStatusChip, PersonCell, PhoneSwitch, SeekerStatusChip, VacancyStatusChip } from '../components/domain';
import { DataTable } from '../components/table';
import { Avatar, Button, Chip, Completeness, Icon, Logo, PageHead, SearchBar, Status, TierBadge, Verified } from '../components/ui';
import { useStore } from '../data/store';

const has = (q: string, ...xs: string[]) => !q || xs.some((x) => x.toLowerCase().includes(q.toLowerCase()));

export function Seekers() {
  const { seekers } = useStore();
  const actions = useSeekerActions();
  const [q, setQ] = useState('');
  const [f, setF] = useState<'all' | 'max' | 'premium' | 'hidden' | 'blocked' | 'reported'>('all');
  const filters = [
    ['all', 'All', seekers.length],
    ['max', 'Max', seekers.filter((s) => s.tier === 'max').length],
    ['premium', 'Premium', seekers.filter((s) => s.tier === 'premium').length],
    ['hidden', 'Hidden', seekers.filter((s) => s.status === 'hidden').length],
    ['blocked', 'Blocked', seekers.filter((s) => s.status === 'blocked').length],
    ['reported', 'With reports', seekers.filter((s) => s.reports > 0).length],
  ] as const;
  const rows = useMemo(
    () =>
      seekers.filter((s) => {
        if (f === 'max' || f === 'premium') return s.tier === f && has(q, s.name, s.role, s.city, s.id);
        if (f === 'hidden' || f === 'blocked') return s.status === f && has(q, s.name, s.role, s.city, s.id);
        if (f === 'reported') return s.reports > 0 && has(q, s.name, s.role, s.city, s.id);
        return has(q, s.name, s.role, s.field, s.city, s.phone, s.id);
      }),
    [seekers, f, q],
  );
  return (
    <>
      <PageHead title="Job seekers" sub="18 402 profiles · 1 106 on paid plans" right={<SearchBar value={q} onChange={setQ} placeholder="Name, phone or ID" />} />
      <PhoneSwitch group="users" />
      <div className="chips">
        {filters.map(([k, l, n]) => (
          <Chip key={k} label={l} count={n} on={f === k} onClick={() => setF(k)} />
        ))}
      </div>
      <DataTable
        rows={rows}
        total={f === 'all' && !q ? '18 402' : undefined}
        href={(s) => `/seekers/${s.id}`}
        columns={[
          { label: 'Person', render: (s) => <PersonCell p={s} /> },
          { label: 'City', render: (s) => s.city },
          { label: 'Age', render: (s) => s.age },
          { label: 'Profile', render: (s) => <Completeness value={s.completeness} /> },
          { label: 'Joined', render: (s) => s.joined },
          { label: 'Last active', render: (s) => <span className="muted">{s.lastActive}</span> },
          {
            label: 'Status',
            render: (s) => (
              <div className="row">
                <SeekerStatusChip s={s.status} />
                {s.reports > 0 && <Status kind="danger" icon="alert-circle">{s.reports}</Status>}
              </div>
            ),
          },
        ]}
        mobile={(s) => (
          <>
            <Avatar src={s.photo} size={56} frame={s.tier === 'max' ? s.frame : undefined} />
            <div className="grow">
              <div className="row" style={{ gap: 6 }}>
                <span className="cell-main">{s.name}</span>
                <TierBadge tier={s.tier} size={16} />
              </div>
              <div className="cell-sub">
                {s.role} · {s.city}
              </div>
              <div className="row" style={{ marginTop: 6 }}>
                <SeekerStatusChip s={s.status} />
                <span className="small muted">{s.lastActive}</span>
              </div>
            </div>
            <Icon name="chevron-right" size={18} />
          </>
        )}
        bulk={(ids, clear) => (
          <>
            <Button size="XS" kind="secondary" icon="eye-off" onClick={() => actions.bulk(ids, 'hide', clear)}>
              Hide
            </Button>
            <Button size="XS" kind="secondary" icon="lock" onClick={() => actions.bulk(ids, 'block', clear)}>
              Block
            </Button>
            <Button size="XS" kind="danger" icon="trash" onClick={() => actions.bulk(ids, 'delete', clear)}>
              Delete
            </Button>
          </>
        )}
      />
    </>
  );
}

export function Companies() {
  const { companies } = useStore();
  const [q, setQ] = useState('');
  const [f, setF] = useState<'all' | 'verified' | 'pending' | 'premium' | 'private' | 'rejected' | 'blocked'>('all');
  const filters = [
    ['all', 'All', companies.length],
    ['verified', 'Verified', companies.filter((c) => c.status === 'verified').length],
    ['pending', 'On review', companies.filter((c) => c.status === 'pending').length],
    ['premium', 'Premium', companies.filter((c) => c.plan === 'premium').length],
    ['private', 'Private recruiters', companies.filter((c) => c.type === 'Private recruiter').length],
    ['rejected', 'Rejected', companies.filter((c) => c.status === 'rejected').length],
    ['blocked', 'Blocked', companies.filter((c) => c.status === 'blocked').length],
  ] as const;
  const rows = companies.filter((c) => {
    const ok = f === 'all' || (f === 'premium' ? c.plan === 'premium' : f === 'private' ? c.type === 'Private recruiter' : c.status === f);
    return ok && has(q, c.name, c.field, c.city, c.licence, c.id);
  });
  return (
    <>
      <PageHead title="Companies" sub="1 284 employers · 92 private recruiters" right={<SearchBar value={q} onChange={setQ} placeholder="Company, licence or ID" />} />
      <PhoneSwitch group="users" />
      <div className="chips">
        {filters.map(([k, l, n]) => (
          <Chip key={k} label={l} count={n} on={f === k} onClick={() => setF(k)} />
        ))}
      </div>
      <DataTable
        rows={rows}
        total={f === 'all' && !q ? '1 284' : undefined}
        href={(c) => (c.status === 'pending' ? `/checks/employers/${c.id}` : `/companies/${c.id}`)}
        columns={[
          { label: 'Company', render: (c) => <CompanyCell c={c} /> },
          { label: 'City', render: (c) => c.city },
          { label: 'Plan', render: (c) => (c.plan === 'premium' ? <Status kind="premium">Premium</Status> : <span className="muted">Free</span>) },
          { label: 'Vacancies', render: (c) => c.stats.posted, align: 'right' },
          { label: 'Hires', render: (c) => c.stats.hires, align: 'right' },
          { label: 'Recruiters', render: (c) => c.recruiterIds.length || 1, align: 'right' },
          { label: 'Joined', render: (c) => c.joined },
          {
            label: 'Status',
            render: (c) => (
              <div className="row">
                <CompanyStatusChip s={c.status} />
                {c.reports > 0 && <Status kind="danger" icon="alert-circle">{c.reports}</Status>}
              </div>
            ),
          },
        ]}
        mobile={(c) => (
          <>
            <Logo initials={c.initials} color={c.color} size={52} radius={14} />
            <div className="grow">
              <div className="row" style={{ gap: 6 }}>
                <span className="cell-main">{c.name}</span>
                {c.status === 'verified' && <Verified />}
              </div>
              <div className="cell-sub">
                {c.field} · {c.city} · {c.stats.posted} vacancies
              </div>
              <div className="row" style={{ marginTop: 6 }}>
                <CompanyStatusChip s={c.status} />
                {c.plan === 'premium' && <Status kind="premium">Premium</Status>}
              </div>
            </div>
            <Icon name="chevron-right" size={18} />
          </>
        )}
      />
    </>
  );
}

export function Vacancies() {
  const { vacancies, companies } = useStore();
  const [q, setQ] = useState('');
  const [f, setF] = useState<'all' | 'live' | 'review' | 'changes' | 'urgent' | 'paused' | 'closed' | 'rejected'>('all');
  const co = (id: string) => companies.find((c) => c.id === id);
  const n = (k: string) => vacancies.filter((v) => (k === 'urgent' ? v.urgent : v.status === k)).length;
  const filters = [
    ['all', 'All', vacancies.length],
    ['live', 'Live', n('live')],
    ['review', 'On review', n('review')],
    ['changes', 'Changes needed', n('changes')],
    ['urgent', 'Urgent', n('urgent')],
    ['paused', 'Paused', n('paused')],
    ['closed', 'Closed', n('closed')],
    ['rejected', 'Rejected', n('rejected')],
  ] as const;
  const rows = vacancies.filter((v) => {
    const ok = f === 'all' || (f === 'urgent' ? v.urgent : v.status === f);
    return ok && has(q, v.title, v.field, co(v.companyId)?.name ?? '', v.id);
  });
  return (
    <>
      <PageHead title="Vacancies" sub="3 917 live · 412 urgent" right={<SearchBar value={q} onChange={setQ} placeholder="Title, company or ID" />} />
      <div className="chips">
        {filters.map(([k, l, c]) => (
          <Chip key={k} label={l} count={c} on={f === k} onClick={() => setF(k)} />
        ))}
      </div>
      <DataTable
        rows={rows}
        total={f === 'all' && !q ? '4 268' : undefined}
        href={(v) => (v.status === 'review' ? `/checks/vacancies/${v.id}` : `/vacancies/${v.id}`)}
        columns={[
          {
            label: 'Vacancy',
            render: (v) => (
              <div className="row" style={{ gap: 12 }}>
                <img src={v.photos[0]} alt="" style={{ width: 48, height: 48, borderRadius: 14, objectFit: 'cover', flex: 'none' }} />
                <div style={{ minWidth: 0 }}>
                  <div className="row" style={{ gap: 6 }}>
                    <span className="cell-main">{v.title}</span>
                    {v.urgent && <Status kind="urgent" icon="flash">Urgent</Status>}
                  </div>
                  <div className="cell-sub">
                    {v.field} · {v.contract}
                  </div>
                </div>
              </div>
            ),
          },
          {
            label: 'Company',
            render: (v) => {
              const c = co(v.companyId);
              return c ? (
                <div className="row">
                  <Logo initials={c.initials} color={c.color} size={28} radius={8} />
                  <span style={{ fontWeight: 600 }}>{c.name}</span>
                </div>
              ) : (
                '—'
              );
            },
          },
          { label: 'Pay', render: (v) => <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{v.pay}<span className="muted" style={{ fontWeight: 400 }}> {v.payNote.split('·')[0]}</span></span> },
          { label: 'Applicants', render: (v) => v.applicants, align: 'right' },
          { label: 'Views', render: (v) => v.views, align: 'right' },
          { label: 'Posted', render: (v) => v.posted },
          { label: 'Status', render: (v) => <VacancyStatusChip s={v.status} /> },
        ]}
        mobile={(v) => (
          <>
            <img src={v.photos[0]} alt="" style={{ width: 64, height: 64, borderRadius: 16, objectFit: 'cover', flex: 'none' }} />
            <div className="grow">
              <div className="cell-main">{v.title}</div>
              <div className="cell-sub">
                {co(v.companyId)?.name} · {v.pay} {v.payNote.split('·')[0]}
              </div>
              <div className="row wrap" style={{ marginTop: 6 }}>
                <VacancyStatusChip s={v.status} />
                {v.urgent && <Status kind="urgent" icon="flash">Urgent</Status>}
                <span className="small muted">{v.applicants} applicants</span>
              </div>
            </div>
          </>
        )}
      />
    </>
  );
}
