import { useState } from 'react';
import { Link } from '../lib/links';
import { Card, Icon, Logo, PageHead, Segmented, TierBadge, Avatar, type IconName } from '../components/ui';
import { useStore } from '../data/store';

function LineChart({ series, labels }: { series: { name: string; color: string; values: number[] }[]; labels: string[] }) {
  const W = 640;
  const H = 220;
  const pad = { l: 40, r: 8, t: 10, b: 26 };
  const n = series[0].values.length;
  const max = Math.ceil(Math.max(...series.flatMap((s) => s.values)) / 200) * 200;
  const x = (i: number) => pad.l + (i * (W - pad.l - pad.r)) / Math.max(1, n - 1);
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const ticks = [0, max / 2, max];
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="chart" onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Daily sign-ups: ${series.map((s) => `${s.name} ${s.values.at(-1)} on the last day`).join(', ')}`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="var(--divider)" />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--text-body)">
              {t}
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
            {hover !== null && <b style={{ color: 'var(--text-headline)', marginLeft: 6 }}>{s.values[hover]}</b>}
          </span>
        ))}
        {hover !== null && <span>day {hover + 1}</span>}
      </div>
    </div>
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
  const { metrics, counts, companies, vacancies, reports } = useStore();
  const [range, setRange] = useState<'7' | '30'>('30');
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
        right={<Segmented items={[{ key: '7', label: '7 days' }, { key: '30', label: '30 days' }]} value={range} onChange={setRange} />}
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
