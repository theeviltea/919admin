import { useEffect, useState } from 'react';
import { api, API_URL } from '../data/api';
import type { Traffic } from '../data/types';
import { useOutletContext } from 'react-router-dom';
import { Link } from '../lib/links';
import { useAuth } from '../data/auth';
import { Card, Icon, IconButton, Logo, PageHead, Segmented, TierBadge, Avatar, type IconName } from '../components/ui';
import { useStore } from '../data/store';

function LineChart({ series, labels, label = 'Daily sign-ups' }: { series: { name: string; color: string; values: number[] }[]; labels: string[]; label?: string }) {
  const W = 640;
  const H = 220;
  const pad = { l: 40, r: 8, t: 10, b: 26 };
  const n = series[0].values.length;
  const top = Math.max(...series.flatMap((s) => s.values));
  const step = top > 2000 ? 1000 : 200;
  const max = Math.ceil(top / step) * step;
  const x = (i: number) => pad.l + (i * (W - pad.l - pad.r)) / Math.max(1, n - 1);
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const ticks = [0, max / 2, max];
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="chart" onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${label}: ${series.map((s) => `${s.name} ${s.values.at(-1)} on the last day`).join(', ')}`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="var(--divider)" />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--text-body)">
              {t >= 1000 ? `${t / 1000}k` : t}
            </text>
          </g>
        ))}
        {labels.map((l, i) => (
          <text key={l} x={x(Math.round((i * (n - 1)) / (labels.length - 1)))} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--text-body)">
            {l}
          </text>
        ))}
        {series.map((s, si) => {
          const d = s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
          return (
            <g key={s.name}>
              {si === 0 && <path d={`${d} L${x(n - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill={s.color} opacity="0.1" />}
              <path d={d} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            </g>
          );
        })}
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="var(--control)" strokeDasharray="3 3" />
            {series.map((s) => (
              <circle key={s.name} cx={x(hover)} cy={y(s.values[hover])} r="4.5" fill={s.color} stroke="var(--surface)" strokeWidth="2" />
            ))}
          </g>
        )}
        {series[0].values.map((_, i) => (
          <rect key={i} x={x(i) - (W - pad.l) / n / 2} y={0} width={(W - pad.l) / n} height={H} fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
      </svg>
      <div className="legend" style={{ marginTop: 8 }}>
        {series.map((s) => (
          <span key={s.name}>
            <i style={{ background: s.color }} />
            {s.name}
            {hover !== null && <b style={{ color: 'var(--text-headline)', marginLeft: 6 }}>{s.values[hover].toLocaleString('en')}</b>}
          </span>
        ))}
        {hover !== null && <span>day {hover + 1}</span>}
      </div>
    </div>
  );
}


const fmt = (n: number) => n.toLocaleString('en').replace(/,/g, ' ');

/** People online now. Live from the API every 15 s; in mock mode the number drifts so the card looks alive. */
function Online({ base }: { base: Traffic['online'] }) {
  const [o, setO] = useState(base);
  useEffect(() => {
    const tick = () => {
      if (API_URL) {
        api.online().then((v) => v && setO(v)).catch(() => undefined);
        return;
      }
      setO((p) => {
        const d = Math.round((Math.random() - 0.45) * 12);
        const total = Math.max(200, p.total + d);
        const k = total / p.total;
        return {
          total,
          ios: Math.round(p.ios * k),
          android: Math.round(p.android * k),
          web: total - Math.round(p.ios * k) - Math.round(p.android * k),
          seekers: Math.round(p.seekers * k),
          employers: total - Math.round(p.seekers * k),
          perMinute: [...p.perMinute.slice(1), total],
        };
      });
    };
    const id = window.setInterval(tick, API_URL ? 15000 : 4000);
    return () => window.clearInterval(id);
  }, []);
  const max = Math.max(...o.perMinute);
  const parts: [string, number, string][] = [
    ['iOS', o.ios, 'var(--primary)'],
    ['Android', o.android, '#34C759'],
    ['Web', o.web, '#FF8652'],
  ];
  return (
    <Card title={<span className="row" style={{ gap: 8 }}><span className="live-dot" />Online now</span>} right={<span className="small muted">last 5 min · live</span>}>
      <div className="row" style={{ alignItems: 'baseline', gap: 10 }}>
        <span className="kpi-v tnum" style={{ fontSize: 40 }} aria-live="polite">
          {fmt(o.total)}
        </span>
        <span className="small muted">
          {fmt(o.seekers)} job seekers · {fmt(o.employers)} employers
        </span>
      </div>
      <div className="spark" aria-label={`Online over the last 30 minutes, from ${o.perMinute[0]} to ${o.total}`} role="img">
        {o.perMinute.map((v, i) => (
          <span key={i} style={{ height: `${Math.max(8, (v / max) * 100)}%`, opacity: 0.35 + (i / o.perMinute.length) * 0.65 }} />
        ))}
      </div>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="small light">30 min ago</span>
        <span className="small light">now</span>
      </div>
      <div className="stack-bar" role="img" aria-label={parts.map(([k, v]) => `${k} ${v}`).join(', ')}>
        {parts.map(([k, v, c]) => (
          <span key={k} style={{ width: `${(v / o.total) * 100}%`, background: c }} />
        ))}
      </div>
      <div className="legend" style={{ flexWrap: 'wrap' }}>
        {parts.map(([k, v, c]) => (
          <span key={k}>
            <i style={{ background: c }} />
            {k} <b style={{ color: 'var(--text-headline)', marginLeft: 4 }}>{v}</b>
          </span>
        ))}
      </div>
    </Card>
  );
}

function HBars({ rows, color = 'var(--primary)', unit = '%' }: { rows: [string, number][]; color?: string; unit?: string }) {
  const max = Math.max(...rows.map((r) => r[1]));
  return (
    <>
      {rows.map(([k, v]) => (
        <div className="hbar" key={k}>
          <span style={{ width: 132, flex: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{k}</span>
          <span className="track">
            <span style={{ width: `${(v / max) * 100}%`, background: color }} />
          </span>
          <span className="strong" style={{ width: 44, textAlign: 'right' }}>
            {v}
            {unit}
          </span>
        </div>
      ))}
    </>
  );
}

/** Active people by hour of the day, with the peak marked. */
function Hours({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const peak = values.indexOf(max);
  return (
    <div className="col" style={{ gap: 8 }}>
      <div className="hours" role="img" aria-label={`Busiest hour ${peak}:00, about ${max} people online`}>
        {values.map((v, h) => (
          <span key={h} className={h === peak ? 'peak' : ''} style={{ height: `${Math.max(4, (v / max) * 100)}%` }} title={`${h}:00 · ${v}`} />
        ))}
      </div>
      <div className="row small light" style={{ justifyContent: 'space-between' }}>
        <span>0:00</span>
        <span>6:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>23:00</span>
      </div>
      <span className="small muted">
        Peak at <b style={{ color: 'var(--text-headline)' }}>{peak}:00–{peak + 1}:00</b>, about {max} people online. Best time for push notifications.
      </span>
    </div>
  );
}

function Retention({ rows }: { rows: Traffic['retention'] }) {
  const cell = (v: number | null) => (
    <td>
      {v === null ? (
        <span className="light">—</span>
      ) : (
        <span className="ret" style={{ background: `color-mix(in srgb, var(--primary) ${Math.round(v * 1.6)}%, var(--back))`, color: v > 35 ? '#fff' : 'var(--text-headline)' }}>
          {v}%
        </span>
      )}
    </td>
  );
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="ret-t">
        <thead>
          <tr>
            <th>Signed up</th>
            <th className="hide-m">People</th>
            <th>Day 1</th>
            <th>Day 7</th>
            <th>Day 30</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.cohort}>
              <td style={{ fontWeight: 600, color: 'var(--text-headline)', whiteSpace: 'nowrap' }}>{r.cohort}</td>
              <td className="muted hide-m">{fmt(r.size)}</td>
              {cell(r.d1)}
              {cell(r.d7)}
              {cell(r.d30)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TrafficSection({ t, range }: { t: Traffic; range: '7' | '30' }) {
  const cut = (a: number[]) => (range === '7' ? a.slice(-7) : a);
  const labels = range === '7' ? ['29 Oct', '1 Nov', '4 Nov'] : t.daily.labels;
  const pc: [string, string][] = [
    ['iOS app', 'var(--primary)'],
    ['Android app', '#34C759'],
    ['Web', '#FF8652'],
  ];
  return (
    <>
      <h2 className="section-h">Traffic and engagement</h2>
      <div className="kpis">
        {t.kpis.map((k) => (
          <div key={k.key} className="kpi">
            <span className="small muted" style={{ fontWeight: 600 }}>
              {k.label}
            </span>
            <span className="kpi-v">{k.value}</span>
            <span className="row" style={{ gap: 6 }}>
              <span className={`delta ${k.trend}`}>{k.delta}</span>
              <span className="small light">{k.sub}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="dash">
        <Card title="Visits and active people" right={<span className="small muted">{range === '7' ? 'Last 7 days' : 'Last 30 days'}</span>}>
          <LineChart
            label="Visits and active people per day"
            labels={labels}
            series={[
              { name: 'Active people (apps and web)', color: 'var(--primary)', values: cut(t.daily.active) },
              { name: 'Web visits', color: '#FF8652', values: cut(t.daily.visits) },
            ]}
          />
        </Card>
        <Online base={t.online} />
      </div>
      <div className="dash3">
        <Card title="Where people come from" right={<span className="small muted">30 days</span>}>
          <HBars rows={t.sources} />
        </Card>
        <Card title="Platforms" right={<span className="small muted">share of sessions</span>}>
          <div className="stack-bar" style={{ height: 14 }}>
            {t.platforms.map(([k, v], i) => (
              <span key={k} style={{ width: `${v}%`, background: pc[i][1] }} />
            ))}
          </div>
          <div className="col" style={{ gap: 0 }}>
            {t.platforms.map(([k, v], i) => (
              <div className="kv-row" key={k}>
                <span className="row" style={{ gap: 8, color: 'var(--text-headline)', fontWeight: 600 }}>
                  <i style={{ width: 10, height: 10, borderRadius: 3, background: pc[i][1], display: 'inline-block' }} />
                  {k}
                </span>
                <span>{v}%</span>
              </div>
            ))}
          </div>
          <span className="small muted" style={{ marginTop: 4 }}>
            Countries
          </span>
          <HBars rows={t.countries} color="#7A3FD1" />
        </Card>
        <Card title="Most viewed screens" right={<span className="small muted">today · avg time</span>} gap={0}>
          {t.screens.map((s, i) => (
            <div key={s.name} className="list-row">
              <span className="rank">{i + 1}</span>
              <span className="grow">
                <span className="t">{s.name}</span>
                <span className="s">{s.views} views</span>
              </span>
              <span className="small muted" style={{ whiteSpace: 'nowrap' }}>
                {s.time}
              </span>
            </div>
          ))}
        </Card>
      </div>
      <div className="two">
        <Card title="Activity by hour" right={<span className="small muted">Dubai time · 7-day average</span>}>
          <Hours values={t.hours} />
        </Card>
        <Card title="Retention" right={<span className="small muted">came back after sign-up</span>}>
          <Retention rows={t.retention} />
        </Card>
      </div>
    </>
  );
}

function QueueLink({ to, icon, title, sub }: { to: string; icon: IconName; title: string; sub: string }) {
  return (
    <Link to={to} className="list-row">
      <span className="check-ic" style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--primary-secondary)', color: 'var(--primary)' }}>
        <Icon name={icon} />
      </span>
      <span className="grow">
        <span className="t">{title}</span>
        <span className="s">{sub}</span>
      </span>
      <Icon name="chevron-right" size={18} />
    </Link>
  );
}

function QueueRow({ to, icon, title, sub, n, tone }: { to: string; icon: IconName; title: string; sub: string; n: number; tone: string }) {
  return (
    <Link to={to} className="list-row">
      <span className="check-ic" style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--back)', color: tone }}>
        <Icon name={icon} />
      </span>
      <span className="grow">
        <span className="t">{title}</span>
        <span className="s">{sub}</span>
      </span>
      <span className="kpi-v" style={{ fontSize: 20, color: n ? tone : 'var(--text-light-secondary)' }}>
        {n}
      </span>
      <Icon name="chevron-right" size={18} />
    </Link>
  );
}

export default function Overview() {
  const { metrics, counts, companies, vacancies, reports, availability } = useStore();
  const [range, setRange] = useState<'7' | '30'>('30');
  const { signOut } = useAuth();
  const { cycleTheme, themeLabel } = useOutletContext<{ cycleTheme: () => void; themeLabel: string }>();
  const slice = (a: number[]) => (range === '7' ? a.slice(-7) : a);
  const labels = range === '7' ? ['17 Oct', '20 Oct', '23 Oct'] : metrics.signups.labels;
  const fieldMax = Math.max(...metrics.fields.map((f) => f[1]));
  const cityTotal = metrics.cities.reduce((a, c) => a + c[1], 0);
  const p = metrics.plans;
  const newestPending = companies.filter((c) => c.status === 'pending').slice(0, 3);
  const kpiLinks: Record<string, string> = { seekers: '/seekers', companies: '/companies', vacancies: '/vacancies', queue: '/checks/employers' };
  return (
    <>
      <PageHead
        title="Overview"
        sub="Monday, 26 October · platform activity"
        right={
          <div className="row" style={{ gap: 8 }}>
            <Segmented items={[{ key: '7', label: '7 days' }, { key: '30', label: '30 days' }]} value={range} onChange={setRange} />
            <span className="hide-d row" style={{ gap: 8 }}>
              <IconButton icon="moon" label={themeLabel} onClick={cycleTheme} />
              <IconButton icon="logout" label="Log out" onClick={signOut} />
            </span>
          </div>
        }
      />
      <div className="kpis">
        {metrics.kpis.map((k) => {
          const inner = (
            <>
              <span className="small muted" style={{ fontWeight: 600 }}>
                {k.label}
              </span>
              <span className="kpi-v">{k.key === 'queue' ? counts.employers + counts.vacancies : k.value}</span>
              <span className="row" style={{ gap: 6 }}>
                <span className={`delta ${k.trend}`}>{k.key === 'queue' ? `${counts.employers} employers` : k.delta}</span>
                <span className="small light">{k.sub}</span>
              </span>
            </>
          );
          return kpiLinks[k.key] ? (
            <Link key={k.key} to={kpiLinks[k.key]} className="kpi">
              {inner}
            </Link>
          ) : (
            <div key={k.key} className="kpi">
              {inner}
            </div>
          );
        })}
      </div>

      <div className="dash">
        <Card title="Sign-ups per day" right={<span className="small muted">{range === '7' ? 'Last 7 days' : 'Last 30 days'}</span>}>
          <LineChart
            labels={labels}
            series={[
              { name: 'Job seekers', color: 'var(--primary)', values: slice(metrics.signups.seekers) },
              { name: 'Companies', color: '#FF8652', values: slice(metrics.signups.companies) },
            ]}
          />
        </Card>
        <Card title="Needs attention" gap={0}>
          <QueueRow to="/checks/employers" icon="building" title="Employer checks" sub="Licence and company data" n={counts.employers} tone="var(--primary)" />
          <QueueRow to="/checks/vacancies" icon="briefcase" title="Vacancy checks" sub="Before a vacancy goes live" n={counts.vacancies} tone="var(--primary)" />
          <QueueRow to="/reports" icon="alert-circle" title="New reports" sub="From people and companies" n={counts.reports} tone="var(--danger-text)" />
          <QueueRow to="/available" icon="flash" title="Available today" sub="Job seekers who can start work today · live" n={availability.length} tone="var(--attention-text)" />
          <QueueRow to="/hires" icon="check-double" title="Hire confirmations" sub="Confirmed by employer and job seeker · 30 days" n={Number(metrics.hires['30'][0].value)} tone="var(--success-text)" />
          {newestPending.length > 0 && (
            <div className="col" style={{ gap: 8, paddingTop: 12 }}>
              <span className="small muted" style={{ fontWeight: 600 }}>
                Waiting longest
              </span>
              {newestPending.map((c) => (
                <Link key={c.id} to={`/checks/employers/${c.id}`} className="row" style={{ textDecoration: 'none', gap: 10 }}>
                  <Logo initials={c.initials} color={c.color} size={32} radius={10} />
                  <span className="grow" style={{ fontWeight: 600 }}>
                    {c.name}
                  </span>
                  <span className="small muted">{c.submitted}</span>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      <TrafficSection t={metrics.traffic} range={range} />

      {/* Phones have no sidebar: messaging lives here. */}
      <div className="hide-d">
        <Card title="Messaging" gap={0}>
          <QueueLink to="/push" icon="notification" title="Push notifications" sub="To phones with notifications on" />
          <QueueLink to="/email" icon="mail" title="Email campaigns" sub="To everyone with an address" />
        </Card>
      </div>

      <div className="dash3">
        <Card title="Hiring funnel" right={<span className="small muted">30 days</span>}>
          {metrics.funnel.map((f) => (
            <div className="funnel-step" key={f.label}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="small muted" style={{ fontWeight: 600 }}>
                  {f.label}
                </span>
                <span className="small muted">{f.share}</span>
              </div>
              <div className="funnel-bar" style={{ width: `${f.width}%`, opacity: 0.55 + f.width / 220 }}>
                {f.value}
              </div>
            </div>
          ))}
        </Card>
        <Card title="Live vacancies by field">
          {metrics.fields.map(([f, v]) => (
            <div className="hbar" key={f}>
              <span style={{ width: 92, flex: 'none' }}>{f}</span>
              <span className="track">
                <span style={{ width: `${(v / fieldMax) * 100}%` }} />
              </span>
              <span className="strong" style={{ width: 48, textAlign: 'right' }}>
                {v.toLocaleString('en').replace(',', ' ')}
              </span>
            </div>
          ))}
        </Card>
        <Card title="Plans and revenue" right={<span className="small muted">{(((p.premium + p.max) / (p.free + p.premium + p.max)) * 100).toFixed(1)}% of seekers pay</span>}>
          <div className="col" style={{ gap: 0 }}>
            {[
              [<span className="row" key="f"><span className="tier" style={{ width: 18, height: 18, background: 'var(--back-darker)' }} />Free</span>, p.free],
              [<span className="row" key="p"><TierBadge tier="premium" />Seeker Premium</span>, p.premium],
              [<span className="row" key="m"><TierBadge tier="max" />Seeker Max</span>, p.max],
              [<span className="row" key="e"><Icon name="building" size={18} />Employer Premium</span>, p.employerPremium],
            ].map(([k, v], i) => (
              <div className="kv-row" key={i}>
                <span style={{ color: 'var(--text-headline)', fontWeight: 600 }}>{k}</span>
                <span>{Number(v).toLocaleString('en').replace(',', ' ')}</span>
              </div>
            ))}
          </div>
          <div className="two" style={{ gap: 8 }}>
            {metrics.revenue.map((r) => (
              <div key={r.label} style={{ background: 'var(--back)', borderRadius: 14, padding: '10px 12px' }}>
                <div className="small muted">{r.label}</div>
                <div className="strong" style={{ fontSize: 16, marginTop: 2 }}>
                  {r.value}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="dash3">
        <Card title="Job seekers by city">
          {metrics.cities.map(([c, v]) => (
            <div className="hbar" key={c}>
              <span style={{ width: 92, flex: 'none' }}>{c}</span>
              <span className="track">
                <span style={{ width: `${(v / cityTotal) * 100}%`, background: '#FF8652' }} />
              </span>
              <span className="strong" style={{ width: 48, textAlign: 'right' }}>
                {Math.round((v / cityTotal) * 100)}%
              </span>
            </div>
          ))}
        </Card>
        <Card title="New vacancies" right={<Link to="/vacancies" className="small" style={{ color: 'var(--link)', fontWeight: 600, textDecoration: 'none' }}>All vacancies</Link>} gap={0}>
          {vacancies.slice(0, 4).map((v) => (
            <Link key={v.id} to={`/vacancies/${v.id}`} className="list-row">
              <img src={v.photos[0]} alt="" style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover' }} />
              <span className="grow">
                <span className="t">{v.title}</span>
                <span className="s">
                  {v.pay} {v.payNote.split('·')[0]}
                </span>
              </span>
            </Link>
          ))}
        </Card>
        <Card title="Latest reports" right={<Link to="/reports" className="small" style={{ color: 'var(--link)', fontWeight: 600, textDecoration: 'none' }}>All reports</Link>} gap={0}>
          {reports.slice(0, 4).map((r) => (
            <Link key={r.id} to={`/reports?id=${r.id}`} className="list-row">
              {r.about.photo ? <Avatar src={r.about.photo} size={44} /> : <Logo initials={r.about.initials ?? '?'} color={r.about.color ?? '#5E6670'} size={44} />}
              <span className="grow">
                <span className="t">{r.reason}</span>
                <span className="s">
                  {r.about.name} · {r.age}
                </span>
              </span>
            </Link>
          ))}
        </Card>
      </div>
    </>
  );
}
