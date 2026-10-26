// Reports: tabs by subject (all / messages / companies / people / vacancies), list + detail.
import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDialogs } from '../components/dialogs';
import { ReportStatusChip } from '../components/domain';
import { Avatar, Button, Card, Chip, Empty, Icon, Logo, PageHead, Segmented, useIsMobile } from '../components/ui';
import { useStore } from '../data/store';
import type { Report, ReportKind, ReportStatus } from '../data/types';

type Tab = 'all' | ReportKind;
const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'message', label: 'Messages' },
  { key: 'company', label: 'Companies' },
  { key: 'person', label: 'People' },
  { key: 'vacancy', label: 'Vacancies' },
];
const KIND_LABEL: Record<ReportKind, string> = { message: 'Message', company: 'Company', person: 'Person', vacancy: 'Vacancy' };

function Who({ p, size = 44 }: { p: { name: string; photo?: string; initials?: string; color?: string }; size?: number }) {
  return p.photo ? <Avatar src={p.photo} size={size} /> : <Logo initials={p.initials ?? '?'} color={p.color ?? '#5E6670'} size={size} radius={size / 3.4} />;
}

function useReportActions() {
  const { act, seekers, companies, recruiters, vacancies } = useStore();
  const { ask } = useDialogs();
  return (r: Report) => {
    const [, kind, id] = r.about.link.split('/');
    const subject =
      kind === 'seekers'
        ? seekers.find((x) => x.id === id)
        : kind === 'companies'
          ? companies.find((x) => x.id === id)
          : kind === 'recruiters'
            ? recruiters.find((x) => x.id === id)
            : vacancies.find((x) => x.id === id);
    const isVacancy = kind === 'vacancies';
    return {
      take: () => act.report(r.id, 'progress', `${r.id} is yours now`),
      dismiss: () =>
        ask({
          title: 'Close without action?',
          text: 'The author gets a note that we checked the report and found no violation.',
          icon: 'check',
          tone: 'primary',
          confirm: 'Close report',
          onConfirm: () => act.report(r.id, 'closed', `${r.id} closed without action`),
        }),
      warn: () =>
        ask({
          title: `Warn ${r.about.name.split(' · ')[0]}?`,
          text: 'They get an official warning from 919 Support. A second warning blocks the account automatically.',
          icon: 'alert-circle',
          tone: 'attention',
          note: { label: 'Message', initial: `We received a report: “${r.reason}”. Please follow the 919 rules — keep all talks and payments in the app.` },
          confirm: 'Send warning',
          onConfirm: () => {
            if (kind === 'seekers' && subject) act.seeker(id, 'warn');
            act.report(r.id, 'closed', `Warning sent, ${r.id} closed`);
          },
        }),
      block: subject
        ? () =>
            ask({
              title: isVacancy ? 'Remove the vacancy?' : `Block ${r.about.name.split(' · ')[0]}?`,
              text: isVacancy ? 'The vacancy is closed and hidden, applicants get a notification.' : 'The account loses access at once. The report is closed with this decision.',
              icon: isVacancy ? 'trash' : 'lock',
              tone: 'danger',
              confirm: isVacancy ? 'Remove vacancy' : 'Block',
              onConfirm: () => {
                if (kind === 'seekers') act.seeker(id, 'block', r.reason);
                if (kind === 'companies') act.company(id, 'block', r.reason);
                if (kind === 'recruiters') act.recruiter(id, 'block');
                if (isVacancy) act.vacancy(id, 'close', r.reason);
                act.report(r.id, 'closed', `${r.about.name.split(' · ')[0]} ${isVacancy ? 'removed' : 'blocked'}, ${r.id} closed`);
              },
            })
        : undefined,
      blockLabel: isVacancy ? 'Remove vacancy' : 'Block',
      reopen: () => act.report(r.id, 'progress', `${r.id} reopened`),
    };
  };
}

function ReportDetail({ r }: { r: Report }) {
  const actionsFor = useReportActions();
  const a = actionsFor(r);
  return (
    <div className="col">
      <Card
        title={
          <span className="row" style={{ gap: 8 }}>
            {r.id}
            <ReportStatusChip s={r.status} />
          </span>
        }
        right={<span className="small muted">{r.age} ago</span>}
      >
        <div className="row" style={{ gap: 12 }}>
          <Who p={r.about} size={56} />
          <div className="grow">
            <div className="small muted" style={{ fontWeight: 600 }}>
              {KIND_LABEL[r.kind]} reported
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, marginTop: 2 }}>{r.about.name}</div>
            <Link to={r.about.link} className="small" style={{ color: 'var(--link)', fontWeight: 600, textDecoration: 'none' }}>
              Open {r.kind === 'vacancy' ? 'vacancy' : r.about.link.startsWith('/companies') ? 'company' : 'profile'}
            </Link>
          </div>
        </div>
        <div style={{ background: 'var(--danger-back)', color: 'var(--danger-text)', borderRadius: 14, padding: '10px 12px', fontWeight: 700, fontSize: 14 }}>{r.reason}</div>
        <p className="para">{r.text}</p>
        <div className="row small muted" style={{ gap: 8 }}>
          <Who p={r.from} size={24} />
          From {r.from.name}
        </div>
      </Card>
      {r.chat && (
        <Card title="Chat excerpt" right={r.context ? <span className="small muted">{r.context}</span> : undefined}>
          <div className="chat">
            {r.chat.map((m, i) => (
              <div key={i} className={`bubble ${m.mine ? 'mine' : 'theirs'} ${m.reported ? 'flag' : ''}`}>
                {m.text}
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4, textAlign: 'right' }}>
                  {m.reported && 'Reported · '}
                  {m.time}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {r.prior && (
        <Card title="History">
          <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
            <span className="check-ic" style={{ background: 'var(--attention-back)', color: 'var(--attention-text)' }}>
              <Icon name="alert-circle" size={14} />
            </span>
            <p className="para" style={{ fontSize: 14 }}>{r.prior}</p>
          </div>
        </Card>
      )}
      <Card title="Decision">
        {r.status === 'closed' ? (
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="muted">This report is closed.</span>
            <Button size="XS" onClick={a.reopen}>
              Reopen
            </Button>
          </div>
        ) : (
          <div className="col" style={{ gap: 8 }}>
            {r.status === 'new' && (
              <Button kind="inverse" icon="user" full onClick={a.take}>
                Take this report
              </Button>
            )}
            <div className="two" style={{ gap: 8 }}>
              <Button kind="attention" icon="alert-circle" full onClick={a.warn}>
                Warn
              </Button>
              {a.block && (
                <Button kind="danger" icon={r.kind === 'vacancy' ? 'trash' : 'lock'} full onClick={a.block}>
                  {a.blockLabel}
                </Button>
              )}
            </div>
            <Button kind="tonal" full onClick={a.dismiss}>
              Close without action
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

export function Reports() {
  const { reports } = useStore();
  const [params, setParams] = useSearchParams();
  const isMobile = useIsMobile();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>('all');
  const [status, setStatus] = useState<ReportStatus | 'open'>('open');
  const inTab = reports.filter((r) => tab === 'all' || r.kind === tab);
  const rows = inTab.filter((r) => (status === 'open' ? r.status !== 'closed' : r.status === status));
  const selId = params.get('id') ?? rows[0]?.id;
  const sel = reports.find((r) => r.id === selId);
  const count = (k: Tab) => reports.filter((r) => (k === 'all' || r.kind === k) && r.status === 'new').length;
  return (
    <>
      <PageHead title="Reports" sub={`${reports.filter((r) => r.status === 'new').length} new · ${reports.filter((r) => r.status === 'progress').length} in progress`} />
      <Segmented items={TABS.map((t) => ({ ...t, count: count(t.key) || undefined }))} value={tab} onChange={setTab} />
      <div className="chips">
        {(
          [
            ['open', 'Open', inTab.filter((r) => r.status !== 'closed').length],
            ['new', 'New', inTab.filter((r) => r.status === 'new').length],
            ['progress', 'In progress', inTab.filter((r) => r.status === 'progress').length],
            ['closed', 'Closed', inTab.filter((r) => r.status === 'closed').length],
          ] as const
        ).map(([k, l, n]) => (
          <Chip key={k} label={l} count={n} on={status === k} onClick={() => setStatus(k)} />
        ))}
      </div>
      <div className="split">
        <div className="table">
          {rows.length ? (
            rows.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`report-row ${!isMobile && r.id === sel?.id ? 'sel' : ''}`}
                onClick={() => (isMobile ? nav(`/reports/${r.id}`) : setParams({ id: r.id }))}
              >
                <Who p={r.about} />
                <span className="grow">
                  <span className="row" style={{ gap: 8, justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>{r.reason}</span>
                    <span className="small muted" style={{ flex: 'none' }}>
                      {r.age}
                    </span>
                  </span>
                  <span className="cell-sub" style={{ display: 'block' }}>
                    {KIND_LABEL[r.kind]} · {r.about.name}
                  </span>
                  <span className="small" style={{ display: 'block', marginTop: 4, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.text}
                  </span>
                  <span className="row" style={{ marginTop: 8 }}>
                    <ReportStatusChip s={r.status} />
                    <span className="small muted">from {r.from.name}</span>
                  </span>
                </span>
              </button>
            ))
          ) : (
            <Empty icon="check-double" title="No reports here" text="Nothing matches this tab and status." />
          )}
        </div>
        {!isMobile && sel && <ReportDetail r={sel} />}
      </div>
    </>
  );
}

export function ReportPage() {
  const { id } = useParams();
  const { reports } = useStore();
  const r = reports.find((x) => x.id === id);
  return (
    <>
      <div className="row" style={{ gap: 10 }}>
        <Link to="/reports" className="icon-btn" aria-label="Back">
          <Icon name="arrow-left" />
        </Link>
        <h1 className="grow" style={{ fontSize: 17, fontWeight: 700, textAlign: 'center' }}>
          Report {id}
        </h1>
        <span style={{ width: 44 }} />
      </div>
      {r ? <ReportDetail r={r} /> : <Empty title="Report not found" />}
    </>
  );
}
