// Full-content detail pages with management tools in the top toolbar.
import { Link, useParams } from 'react-router-dom';
import { useCompanyActions, useRecruiterActions, useSeekerActions, useVacancyActions } from '../components/actions';
import { CompanyStatusChip, SeekerStatusChip, VacancyStatusChip } from '../components/domain';
import { Audit, Avatar, Button, Card, Checks, Empty, FRAMES, Gallery, Icon, KV, Logo, Status, Tags, TierBadge, Timeline, Toolbar, Verified, Videos } from '../components/ui';
import { useStore } from '../data/store';
import type { Company, Vacancy } from '../data/types';

function NotFound({ what, back }: { what: string; back: string }) {
  return (
    <div className="table">
      <Empty title={`${what} not found`} text="It may have been deleted. Go back to the list." />
      <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 32 }}>
        <Button to={back} kind="secondary" icon="arrow-left">
          Back to the list
        </Button>
      </div>
    </div>
  );
}

function neighbours<T extends { id: string }>(list: T[], id: string, base: string) {
  const i = list.findIndex((x) => x.id === id);
  return {
    label: `${i + 1} of ${list.length}`,
    prev: i > 0 ? `${base}/${list[i - 1].id}` : undefined,
    next: i < list.length - 1 ? `${base}/${list[i + 1].id}` : undefined,
  };
}

function NoReports({ text }: { text: string }) {
  return (
    <div className="row" style={{ gap: 10, padding: '4px 0', fontSize: 14, color: 'var(--text-body)' }}>
      <span className="check-ic" style={{ background: 'var(--success-back)', color: 'var(--success-text)' }}>
        <Icon name="check" size={14} />
      </span>
      {text}
    </div>
  );
}

function ReportsLink({ n, name }: { n: number; name: string }) {
  if (!n) return <NoReports text={`No reports about ${name}`} />;
  return (
    <Link to="/reports" className="row" style={{ gap: 10, textDecoration: 'none', fontSize: 14 }}>
      <span className="check-ic" style={{ background: 'var(--danger-back)', color: 'var(--danger-text)' }}>
        <Icon name="alert-circle" size={14} />
      </span>
      <span className="grow" style={{ fontWeight: 600 }}>
        {n} {n === 1 ? 'report' : 'reports'} · open in Reports
      </span>
      <Icon name="chevron-right" size={18} />
    </Link>
  );
}

/* ================= Job seeker ================= */
export function SeekerDetail() {
  const { id = '' } = useParams();
  const { seekers } = useStore();
  const a = useSeekerActions();
  const p = seekers.find((s) => s.id === id);
  if (!p) return <NotFound what="Profile" back="/seekers" />;
  const ring = p.tier === 'max' && p.frame ? FRAMES[p.frame] : undefined;
  return (
    <>
      <Toolbar
        crumbs={[{ label: 'Job seekers', to: '/seekers' }, { label: p.name }]}
        pos={neighbours(seekers, id, '/seekers')}
        lead={<Avatar src={p.photo} size={56} frame={p.tier === 'max' ? p.frame : undefined} />}
        title={p.name}
        chips={
          <>
            <TierBadge tier={p.tier} size={22} />
            <SeekerStatusChip s={p.status} />
          </>
        }
        sub={`${p.role} · ${p.city} · joined ${p.joined} · ID ${p.id.slice(1)}`}
        actions={
          <>
            <Button icon="edit" onClick={() => a.edit(p)}>
              Edit
            </Button>
            <Button kind="attention" icon="message" onClick={() => a.requestChanges(p)}>
              Request changes
            </Button>
            <Button icon={p.status === 'hidden' ? 'view' : 'eye-off'} onClick={() => a.hide(p)}>
              {p.status === 'hidden' ? 'Show' : 'Hide'}
            </Button>
            <Button icon="lock" onClick={() => a.block(p)}>
              {p.status === 'blocked' ? 'Unblock' : 'Block'}
            </Button>
            <Button kind="danger" icon="trash" onClick={() => a.remove(p, '/seekers')}>
              Delete
            </Button>
          </>
        }
      />
      <div className="page-grid">
        <div className="col">
          <section className="hero">
            {p.header ? <img src={p.header} alt="Custom profile header" /> : <div style={{ height: 72, background: 'var(--back-darker)' }} />}
            <div className="hero-body">
              <div
                style={{
                  flex: 'none',
                  marginTop: p.header ? -56 : -40,
                  width: 124,
                  height: 124,
                  borderRadius: '50%',
                  padding: ring ? 5 : 0,
                  background: ring ?? 'var(--surface)',
                }}
              >
                <img src={p.photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', border: '4px solid var(--surface)', objectFit: 'cover', objectPosition: 'center 25%', display: 'block' }} />
              </div>
              <div className="grow" style={{ paddingTop: 14, minWidth: 220 }}>
                <div className="row">
                  <span className="hero-name">{p.name}</span>
                  <TierBadge tier={p.tier} size={22} />
                </div>
                <div className="row wrap muted" style={{ marginTop: 6, gap: 14, fontSize: 14 }}>
                  <span>
                    {p.age} years · {p.gender}
                  </span>
                  <span className="row" style={{ gap: 4 }}>
                    <Icon name="location" size={16} />
                    {p.city}, United Arab Emirates
                  </span>
                </div>
                <div style={{ marginTop: 10 }}>
                  <Tags items={[`${p.field} · ${p.role}`]} blue />
                </div>
              </div>
              <div className="row" style={{ gap: 22, paddingBottom: 4 }}>
                <div className="stat"><b>{p.stats.views}</b><span>Profile views</span></div>
                <div className="stat"><b>{p.stats.applications}</b><span>Applications</span></div>
                <div className="stat"><b>{p.stats.invites}</b><span>Invites</span></div>
              </div>
            </div>
          </section>
          <Card title="Photos" count={p.photos.length}>
            <Gallery photos={p.photos} />
          </Card>
          <Card title="Videos" count={p.videos.length}>
            <Videos items={p.videos} />
          </Card>
          <Card title="About">
            <p className="para">{p.about}</p>
          </Card>
          <div className="two">
            <Card title="Languages" gap={4}>
              <KV rows={p.languages} />
            </Card>
            <Card title={`${p.field} details`} gap={4}>
              <KV rows={p.details} />
            </Card>
          </div>
          <Card title="Experience" gap={0}>
            <Timeline items={p.experience.map((e) => [e.role, e.place, e.period])} />
          </Card>
          <Card title="Education" gap={0}>
            <Timeline items={p.education.map((e) => [e.title, e.school, e.years])} />
          </Card>
          <Card title="Portfolio and socials" gap={0}>
            {p.links.map((l) => (
              <div className="list-row" key={l.code}>
                <span className="check-ic" style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--back)', fontSize: 11, fontWeight: 700 }}>
                  {l.code}
                </span>
                <span className="grow">
                  <span className="t">{l.label}</span>
                  <span className="s">{l.value}</span>
                </span>
              </div>
            ))}
          </Card>
        </div>
        <div className="col">
          <Card title="Account" gap={4}>
            <KV
              rows={[
                ['ID', p.id.slice(1)],
                ['Phone', <>{p.phone} <Status kind="success" icon="check">Verified</Status></>],
                ['Email', p.email],
                ['Signed up', `${p.joined} · ${p.platform}`],
                ['Last active', p.lastActive],
                ['Visibility', p.status === 'active' ? <Status kind="success">Visible to employers</Status> : <SeekerStatusChip s={p.status} />],
              ]}
            />
          </Card>
          <Card title="Subscription" gap={4}>
            {p.plan ? (
              <KV
                rows={[
                  ['Plan', <><TierBadge tier={p.tier} />{p.tier === 'max' ? 'Max' : 'Premium'} · monthly</>],
                  ['Since', p.plan.since],
                  ['Renews', p.plan.renews],
                  ['Payment', p.plan.payment],
                  ...(p.tier === 'max' ? ([['Look', `${p.frame ? p.frame[0].toUpperCase() + p.frame.slice(1) : 'No'} frame · own header`]] as [string, string][]) : []),
                ]}
              />
            ) : (
              <KV rows={[['Plan', 'Free'], ['Applications this month', '7 of 10']]} />
            )}
          </Card>
          <Card title="Activity" gap={4}>
            <KV
              rows={[
                ['Applications', `${p.stats.applications} · ${p.stats.accepted} accepted`],
                ['Invites from employers', p.stats.invites],
                ['Chats', p.stats.chats],
              ]}
            />
          </Card>
          <Card title="Reports" gap={8}>
            <ReportsLink n={p.reports} name="this person" />
          </Card>
          <Card title="Admin log" gap={10}>
            <Audit items={p.log} />
          </Card>
        </div>
      </div>
    </>
  );
}

/* ================= Company (also the employer check page) ================= */
function VacancyRows({ items }: { items: Vacancy[] }) {
  if (!items.length) return <div className="small muted" style={{ padding: '8px 0' }}>No vacancies yet</div>;
  return (
    <div>
      {items.map((v) => (
        <Link key={v.id} to={`/vacancies/${v.id}`} className="list-row">
          <img src={v.photos[0]} alt="" style={{ width: 52, height: 52, borderRadius: 14, objectFit: 'cover', flex: 'none' }} />
          <span className="grow">
            <span className="t">{v.title}</span>
            <span className="s">
              {v.pay} {v.payNote.split('·')[0]} · {v.contract}
            </span>
          </span>
          <span className="hide-m small muted">{v.applicants} applicants</span>
          <VacancyStatusChip s={v.status} />
          <Icon name="chevron-right" size={18} />
        </Link>
      ))}
    </div>
  );
}

function CompanyBody({ c, review }: { c: Company; review: boolean }) {
  const { recruiters, vacancies } = useStore();
  const team = recruiters.filter((r) => r.companyId === c.id);
  const vacs = vacancies.filter((v) => v.companyId === c.id);
  return (
    <div className="page-grid">
      <div className="col">
        <section className="hero">
          <img src={c.cover} alt="Company cover" />
          <div className="hero-body">
            <div style={{ marginTop: -44, borderRadius: 28, border: '4px solid var(--surface)', background: 'var(--surface)' }}>
              <Logo initials={c.initials} color={c.color} size={96} radius={24} />
            </div>
            <div className="grow" style={{ paddingTop: 14, minWidth: 220 }}>
              <div className="row">
                <span className="hero-name">{c.name}</span>
                {c.status === 'verified' && <Verified />}
              </div>
              <div className="row wrap muted" style={{ marginTop: 6, gap: 14, fontSize: 14 }}>
                <span>
                  {c.type} · {c.field}
                </span>
                <span className="row" style={{ gap: 4 }}>
                  <Icon name="location" size={16} />
                  {c.address}
                </span>
              </div>
            </div>
            {!review && (
              <div className="row" style={{ gap: 22, paddingBottom: 4 }}>
                <div className="stat"><b>{c.stats.posted}</b><span>Vacancies</span></div>
                <div className="stat"><b>{c.stats.applicants}</b><span>Applicants</span></div>
                <div className="stat"><b>{c.stats.hires}</b><span>Hires</span></div>
              </div>
            )}
          </div>
        </section>
        {review && c.checks && (
          <Card title="Automatic checks">
            <Checks items={c.checks} />
          </Card>
        )}
        {review && (
          <Card title="Documents" count={c.documents.length}>
            <div className="two">
              {c.documents.map((d) => (
                <div key={d.name} className="row" style={{ gap: 12, padding: 12, borderRadius: 16, background: 'var(--back)' }}>
                  <span className="check-ic" style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--surface)', color: d.kind === 'pdf' ? 'var(--danger-text)' : 'var(--primary)' }}>
                    <Icon name={d.kind === 'pdf' ? 'file' : 'image'} />
                  </span>
                  <span className="grow">
                    <span className="t" style={{ fontSize: 14, fontWeight: 600, display: 'block' }}>{d.name}</span>
                    <span className="small muted">{d.note}</span>
                  </span>
                  <Icon name="download" size={18} />
                </div>
              ))}
            </div>
          </Card>
        )}
        <Card title="About the company">
          <p className="para">{c.about}</p>
        </Card>
        <Card title="Photos" count={c.photos.length}>
          <Gallery photos={c.photos} />
        </Card>
        <Card title="Vacancies" count={vacs.length} gap={0}>
          <VacancyRows items={vacs} />
        </Card>
        <Card title="Recruiters" count={team.length} gap={0}>
          {team.length ? (
            team.map((r) => (
              <Link key={r.id} to={`/recruiters/${r.id}`} className="list-row">
                <Avatar src={r.photo} size={44} />
                <span className="grow">
                  <span className="t">{r.name}</span>
                  <span className="s">
                    {r.role} · {r.title}
                  </span>
                </span>
                <span className="hide-m small muted">
                  {r.vacancies} vacancies · {r.chats} chats
                </span>
                {r.status === 'blocked' && <Status kind="danger" icon="lock">Blocked</Status>}
                <Icon name="chevron-right" size={18} />
              </Link>
            ))
          ) : (
            <div className="small muted" style={{ padding: '8px 0' }}>The owner works alone, no other recruiters</div>
          )}
        </Card>
      </div>
      <div className="col">
        <Card title="Company data" gap={4}>
          <KV
            rows={[
              ['ID', c.id.slice(1)],
              ['Licence', c.licence],
              ['Licence expires', c.licenceExpires],
              ['Phone', c.phone],
              ['Website', c.website],
              ['Instagram', c.instagram],
              ['Joined', c.joined],
            ]}
          />
        </Card>
        <Card title="Plan" gap={4}>
          <KV
            rows={[
              ['Plan', c.plan === 'premium' ? <Status kind="premium">Premium</Status> : 'Free'],
              ['Urgent boosts', c.plan === 'premium' ? '3 this month' : '—'],
              ['Avg. reply time', c.stats.replyTime],
            ]}
          />
        </Card>
        <Card title="Reports" gap={8}>
          <ReportsLink n={c.reports} name="this company" />
        </Card>
        <Card title="Admin log" gap={10}>
          <Audit items={c.log} />
        </Card>
      </div>
    </div>
  );
}

export function CompanyDetail({ review = false }: { review?: boolean }) {
  const { id = '' } = useParams();
  const { companies } = useStore();
  const a = useCompanyActions();
  const c = companies.find((x) => x.id === id);
  const base = review ? '/checks/employers' : '/companies';
  if (!c) return <NotFound what="Company" back={base} />;
  const list = review ? companies.filter((x) => x.status === 'pending' || x.id === id) : companies;
  const pending = c.status === 'pending';
  return (
    <>
      <Toolbar
        crumbs={[{ label: review ? 'Employer checks' : 'Companies', to: base }, { label: c.name }]}
        pos={neighbours(list, id, base)}
        lead={<Logo initials={c.initials} color={c.color} size={56} radius={16} />}
        title={c.name}
        chips={<CompanyStatusChip s={c.status} />}
        sub={review && c.submitted ? `${c.type} · sent ${c.submitted}` : `${c.type} · ${c.field} · ${c.city} · ID ${c.id.slice(1)}`}
        actions={
          pending ? (
            <>
              <Button icon="edit" onClick={() => a.edit(c)}>
                Edit
              </Button>
              <Button kind="attention" icon="message" onClick={() => a.requestChanges(c)}>
                Request changes
              </Button>
              <Button kind="danger" icon="cancel" onClick={() => a.reject(c, base)}>
                Reject
              </Button>
              <Button kind="primary" icon="check" onClick={() => a.approve(c, base)}>
                Verify
              </Button>
            </>
          ) : (
            <>
              <Button icon="edit" onClick={() => a.edit(c)}>
                Edit
              </Button>
              <Button kind="attention" icon="message" onClick={() => a.requestChanges(c)}>
                Request changes
              </Button>
              {c.status === 'rejected' ? (
                <Button kind="primary" icon="check" onClick={() => a.approve(c)}>
                  Verify
                </Button>
              ) : (
                <Button icon="lock" onClick={() => a.block(c)}>
                  {c.status === 'blocked' ? 'Unblock' : 'Block'}
                </Button>
              )}
              <Button kind="danger" icon="trash" onClick={() => a.remove(c)}>
                Delete
              </Button>
            </>
          )
        }
      />
      <CompanyBody c={c} review={review || pending} />
    </>
  );
}

/* ================= Recruiter ================= */
export function RecruiterDetail() {
  const { id = '' } = useParams();
  const { recruiters, companies, vacancies } = useStore();
  const a = useRecruiterActions();
  const r = recruiters.find((x) => x.id === id);
  if (!r) return <NotFound what="Recruiter" back="/companies" />;
  const c = companies.find((x) => x.id === r.companyId);
  const vacs = vacancies.filter((v) => v.companyId === r.companyId && v.postedBy === r.name);
  const back = c ? `/companies/${c.id}` : '/companies';
  return (
    <>
      <Toolbar
        crumbs={[{ label: 'Companies', to: '/companies' }, { label: c?.name ?? 'Company', to: back }, { label: r.name }]}
        lead={<Avatar src={r.photo} size={56} />}
        title={r.name}
        chips={r.status === 'blocked' ? <Status kind="danger" icon="lock">Blocked</Status> : <Status kind="success">Active</Status>}
        sub={`${r.role} · ${r.title} at ${c?.name ?? '—'}`}
        actions={
          <>
            {c && (
              <Button icon="building" to={back}>
                Open company
              </Button>
            )}
            <Button icon="lock" onClick={() => a.block(r)}>
              {r.status === 'blocked' ? 'Unblock' : 'Block'}
            </Button>
            <Button kind="danger" icon="trash" onClick={() => a.remove(r, back)}>
              Remove
            </Button>
          </>
        }
      />
      <div className="page-grid">
        <div className="col">
          <section className="card" style={{ flexDirection: 'row', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <Avatar src={r.photo} size={96} />
            <div className="grow" style={{ minWidth: 200 }}>
              <div className="hero-name">{r.name}</div>
              <div className="muted" style={{ marginTop: 6, fontSize: 14 }}>
                {r.title} · recruiting since {r.since}
              </div>
              {c && (
                <Link to={back} className="row" style={{ marginTop: 10, textDecoration: 'none', gap: 8 }}>
                  <Logo initials={c.initials} color={c.color} size={28} radius={8} />
                  <span style={{ fontWeight: 600 }}>{c.name}</span>
                  {c.status === 'verified' && <Verified />}
                </Link>
              )}
            </div>
            <div className="row" style={{ gap: 22 }}>
              <div className="stat"><b>{r.vacancies}</b><span>Vacancies</span></div>
              <div className="stat"><b>{r.chats}</b><span>Chats</span></div>
              <div className="stat"><b>{r.hires}</b><span>Hires</span></div>
            </div>
          </section>
          <Card title="Vacancies by this recruiter" count={vacs.length} gap={0}>
            <VacancyRows items={vacs} />
          </Card>
          <Card title="Recent chats" gap={0}>
            {['Layla Haddad', 'Sara Mendes', 'Zara King'].map((n, i) => (
              <div className="list-row" key={n}>
                <span className="check-ic" style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--back)' }}>
                  <Icon name="message" size={18} />
                </span>
                <span className="grow">
                  <span className="t">{n}</span>
                  <span className="s">{['Shortlisted · interview on Thursday', 'Declined · another candidate', 'Hired · trial day done'][i]}</span>
                </span>
                <span className="small muted">{['Today', 'Yesterday', '20 Oct'][i]}</span>
              </div>
            ))}
          </Card>
        </div>
        <div className="col">
          <Card title="Account" gap={4}>
            <KV
              rows={[
                ['ID', r.id.slice(1)],
                ['Role in company', r.role],
                ['Phone', r.phone],
                ['Email', r.email],
                ['Since', r.since],
                ['Last active', r.lastActive],
              ]}
            />
          </Card>
          <Card title="Reports" gap={8}>
            <ReportsLink n={r.id === 'r55201' ? 3 : 0} name="this recruiter" />
          </Card>
        </div>
      </div>
    </>
  );
}

/* ================= Vacancy (also the vacancy check page) ================= */
function Highlight({ text, flag }: { text: string; flag?: string }) {
  if (!flag || !text.includes(flag)) return <>{text}</>;
  const [a, b] = text.split(flag);
  return (
    <>
      {a}
      <mark className="mark">{flag}</mark>
      {b}
    </>
  );
}

export function VacancyDetail({ review = false }: { review?: boolean }) {
  const { id = '' } = useParams();
  const { vacancies, companies } = useStore();
  const a = useVacancyActions();
  const v = vacancies.find((x) => x.id === id);
  const base = review ? '/checks/vacancies' : '/vacancies';
  if (!v) return <NotFound what="Vacancy" back={base} />;
  const c = companies.find((x) => x.id === v.companyId);
  const onReview = v.status === 'review';
  const list = review ? vacancies.filter((x) => x.status === 'review' || x.id === id) : vacancies;
  const bad = v.checks?.some((x) => x.level === 'bad');
  return (
    <>
      <Toolbar
        crumbs={[{ label: review ? 'Vacancy checks' : 'Vacancies', to: base }, { label: v.title }]}
        pos={neighbours(list, id, base)}
        lead={<img src={v.photos[0]} alt="" style={{ width: 56, height: 56, borderRadius: 16, objectFit: 'cover', flex: 'none' }} />}
        title={v.title}
        chips={
          <>
            <VacancyStatusChip s={v.status} />
            {v.urgent && <Status kind="urgent" icon="flash">Urgent</Status>}
          </>
        }
        sub={`${c?.name ?? '—'} · ${v.postedBy} · ${v.posted} · ID ${v.id.slice(1)}`}
        actions={
          onReview ? (
            <>
              <Button icon="edit" onClick={() => a.edit(v)}>
                Edit
              </Button>
              <Button kind="attention" icon="message" onClick={() => a.requestChanges(v, base)}>
                Request changes
              </Button>
              <Button kind="danger" icon="cancel" onClick={() => a.reject(v, base)}>
                Reject
              </Button>
              <Button kind="primary" icon="check" onClick={() => a.approve(v, base)} disabled={bad}>
                Approve
              </Button>
            </>
          ) : (
            <>
              <Button icon="edit" onClick={() => a.edit(v)}>
                Edit
              </Button>
              <Button kind="attention" icon="message" onClick={() => a.requestChanges(v)}>
                Request changes
              </Button>
              {(v.status === 'live' || v.status === 'paused') && (
                <Button icon={v.status === 'paused' ? 'play' : 'pause'} onClick={() => a.pause(v)}>
                  {v.status === 'paused' ? 'Publish' : 'Pause'}
                </Button>
              )}
              {v.status !== 'closed' && v.status !== 'rejected' && (
                <Button icon="lock" onClick={() => a.close(v)}>
                  Close
                </Button>
              )}
              <Button kind="danger" icon="trash" onClick={() => a.remove(v)}>
                Delete
              </Button>
            </>
          )
        }
      />
      <div className="page-grid">
        <div className="col">
          {onReview && v.checks && (
            <Card title="Automatic checks" right={bad ? <span className="small" style={{ color: 'var(--danger-text)', fontWeight: 600 }}>Fix or send back before approving</span> : undefined}>
              <Checks items={v.checks} />
            </Card>
          )}
          <Card title="Photos" count={v.photos.length}>
            <div className="gallery" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
              {v.photos.map((ph, i) => (
                <div key={i} style={{ height: 220, borderRadius: 16, overflow: 'hidden', background: 'var(--back-darker)' }}>
                  <img src={ph} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%', display: 'block' }} />
                </div>
              ))}
            </div>
          </Card>
          <section className="card">
            <div className="row wrap" style={{ gap: 8 }}>
              <span className="kpi-v" style={{ fontSize: 26 }}>{v.pay}</span>
              <span className="muted">{v.payNote}</span>
            </div>
            {v.facts.length > 0 && (
              <div className="two" style={{ gap: 0, columnGap: 24 }}>
                {v.facts.map(([k, val]) => (
                  <div className="kv-row" key={k}>
                    <span>{k}</span>
                    <span>{val}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
          <Card title="Description">
            <p className="para">{v.description ? <Highlight text={v.description} flag={v.flagged} /> : <span className="muted">The employer didn’t add a description.</span>}</p>
          </Card>
          {v.requirements.length > 0 && (
            <Card title="Requirements">
              <Tags items={v.requirements} />
            </Card>
          )}
          {v.conditions.length > 0 && (
            <Card title="Conditions" gap={4}>
              <KV rows={v.conditions} />
            </Card>
          )}
        </div>
        <div className="col">
          {c && (
            <Card title="Employer" gap={8}>
              <Link to={c.status === 'pending' ? `/checks/employers/${c.id}` : `/companies/${c.id}`} className="list-row" style={{ paddingTop: 0 }}>
                <Logo initials={c.initials} color={c.color} size={44} />
                <span className="grow">
                  <span className="t">{c.name}</span>
                  <span className="s">
                    {c.field} · {c.city}
                  </span>
                </span>
                <Icon name="chevron-right" size={18} />
              </Link>
              <KV
                rows={[
                  ['Status', <CompanyStatusChip s={c.status} key="s" />],
                  ['Posted by', v.postedBy],
                  ['Vacancies', c.stats.posted],
                  ['Reports', c.reports || 'None'],
                ]}
              />
            </Card>
          )}
          <Card title="Performance" gap={4}>
            <KV
              rows={[
                ['Views', v.views],
                ['Applicants', v.applicants],
                ['Urgent', v.urgent ? 'On · AED 35' : 'Off'],
                ['Contract', v.contract],
              ]}
            />
          </Card>
          <Card title="Admin log" gap={10}>
            {v.log.length ? <Audit items={v.log} /> : <span className="small muted">No admin actions yet</span>}
          </Card>
        </div>
      </div>
    </>
  );
}
