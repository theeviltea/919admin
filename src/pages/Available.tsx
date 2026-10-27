// Available today: job seekers who can start work within 24 hours. Employers see them in Talent → Today.
import { useEffect, useMemo, useState } from 'react';
import { DataTable } from '../components/table';
import { Avatar, Button, Icon, PageHead, SearchBar, Segmented, Status, TierBadge, useIsMobile, type IconName } from '../components/ui';
import { useStore } from '../data/store';
import type { Availability, Seeker } from '../data/types';

const KPI_ICONS: Record<string, IconName> = { now: 'flash', today: 'users', extended: 'clock', messaged: 'message', hired: 'check-double' };

/** "22 h left" / "47 min left" — admins see the time left, employers don't. */
function left(endsAt: number, now: number) {
  const m = Math.max(0, Math.round((endsAt - now) / 60000));
  return m >= 60 ? `${Math.floor(m / 60)} h left` : `${m} min left`;
}

function WhenChip({ when }: { when: string }) {
  return (
    <span className="avail-chip">
      <Icon name="flash" size={14} />
      {when}
    </span>
  );
}

function NoteCell({ a }: { a: Availability }) {
  if (a.reports)
    return (
      <Status kind="danger" icon="alert-circle">
        {a.reports} report{a.reports > 1 ? 's' : ''}
      </Status>
    );
  if (a.extended) return <Status kind="pending">Extended once</Status>;
  return <span className="muted">—</span>;
}

const FIELDS = ['Hospitality', 'F&B', 'Events', 'Modeling', 'Music', 'Beauty', 'Service'];
const order = (f: string) => (FIELDS.includes(f) ? FIELDS.indexOf(f) : FIELDS.length);

type Row = Availability & { p: Seeker };
type Tab = 'all' | 'reports' | string;

export default function Available() {
  const { availability, seekers, metrics, act } = useStore();
  const isMobile = useIsMobile();
  const [tab, setTab] = useState<Tab>('all');
  const [q, setQ] = useState('');
  // The time left ticks every minute.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(t);
  }, []);

  const rows = useMemo<Row[]>(
    () =>
      availability
        .filter((a) => a.endsAt > now)
        .map((a) => ({ ...a, p: seekers.find((s) => s.id === a.seekerId)! }))
        .filter((r) => r.p)
        .sort((a, b) => b.endsAt - a.endsAt),
    [availability, seekers, now],
  );
  // Fixed order, so the tabs don't jump when someone is turned off.
  const fields = [...new Set(rows.map((r) => r.p.field))].sort((a, b) => order(a) - order(b));
  const inTab = (r: Row, t: Tab) => t === 'all' || (t === 'reports' ? !!r.reports : r.p.field === t);
  const needle = q.trim().toLowerCase();
  const shown = rows.filter((r) => inTab(r, tab) && (!needle || r.p.name.toLowerCase().includes(needle) || r.p.id.includes(needle)));
  const turnOff = (r: Row) => act.availOff(r.seekerId);

  return (
    <>
      <PageHead title="Available today" sub="Job seekers who can start work today · live" right={<SearchBar value={q} onChange={setQ} placeholder="Name or ID" />} />
      <div className="kpis hires-kpis">
        {/* Phones keep the two numbers that matter most. */}
        {metrics.avail.filter((k) => !isMobile || k.key === 'now' || k.key === 'hired').map((k) => (
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
      <div className="avail-note">
        <span className="avail-note-ic">
          <Icon name="flash" size={16} />
        </span>
        <span>
          Job seekers turn on <b>Available today</b> for 24 hours. Employers see them in Talent → Today; only verified companies can message them. Admins see the time left, employers don’t.
        </span>
      </div>
      <Segmented
        items={[
          { key: 'all', label: 'All', count: rows.length },
          ...fields.map((f) => ({ key: f, label: f, count: rows.filter((r) => r.p.field === f).length })),
          { key: 'reports', label: 'With reports', count: rows.filter((r) => r.reports).length },
        ]}
        value={tab}
        onChange={setTab}
      />
      <DataTable
        rows={shown}
        href={(r) => `/seekers/${r.seekerId}`}
        emptyTitle="No one is available right now"
        emptyText="People show up here when they turn on Available today in the app."
        columns={[
          {
            label: 'Person',
            render: (r) => (
              <div className="row" style={{ gap: 10 }}>
                <Avatar src={r.p.photo} size={40} />
                <div style={{ minWidth: 0 }}>
                  <div className="cell-main row" style={{ gap: 6 }}>
                    {r.p.name}
                    <TierBadge tier={r.p.tier} size={16} />
                  </div>
                  <div className="cell-sub">
                    {r.p.role} · {r.p.city}
                  </div>
                </div>
              </div>
            ),
          },
          { label: 'When', render: (r) => <WhenChip when={r.when} /> },
          { label: 'Ends in', render: (r) => <span className="strong">{left(r.endsAt, now)}</span> },
          { label: 'Views', render: (r) => r.views },
          { label: 'Messages', render: (r) => r.messages },
          { label: 'Note', render: (r) => <NoteCell a={r} /> },
          {
            label: '',
            width: 120,
            render: (r) => (
              <span onClick={(e) => (e.preventDefault(), e.stopPropagation())}>
                <Button size="XS" onClick={() => turnOff(r)}>
                  Turn off
                </Button>
              </span>
            ),
          },
        ]}
        mobile={(r) => (
          <div className="col" style={{ gap: 10, width: '100%' }}>
            <div className="row" style={{ gap: 10 }}>
              <Avatar src={r.p.photo} size={44} />
              <div className="grow" style={{ minWidth: 0 }}>
                <div className="cell-main row" style={{ gap: 6 }}>
                  {r.p.name}
                  <TierBadge tier={r.p.tier} size={16} />
                </div>
                <div className="cell-sub">{r.p.role}</div>
              </div>
              <WhenChip when={r.when} />
            </div>
            <div className="row small muted" style={{ gap: 12 }}>
              <span className="strong" style={{ color: 'var(--text-headline)' }}>
                {left(r.endsAt, now)}
              </span>
              <span>
                {r.views} view{r.views === 1 ? '' : 's'}
              </span>
              <span>
                {r.messages} message{r.messages === 1 ? '' : 's'}
              </span>
              <span className="grow" />
              <span onClick={(e) => (e.preventDefault(), e.stopPropagation())}>
                <Button size="XS" onClick={() => turnOff(r)}>
                  Turn off
                </Button>
              </span>
            </div>
            {r.reports ? <NoteCell a={r} /> : null}
          </div>
        )}
      />
    </>
  );
}
