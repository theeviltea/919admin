// Moderation queues: new employers and vacancies waiting for a decision.
import { Link } from 'react-router-dom';
import { useCompanyActions, useVacancyActions } from '../components/actions';
import { PhoneSwitch } from '../components/domain';
import { Button, Empty, Icon, Logo, PageHead, Status } from '../components/ui';
import { useStore } from '../data/store';

export function EmployerChecks() {
  const { companies, recruiters } = useStore();
  const a = useCompanyActions();
  const queue = companies.filter((c) => c.status === 'pending');
  return (
    <>
      <PageHead title="Employer checks" sub={queue.length ? `${queue.length} waiting · we answer within 24 hours` : 'Queue is empty'} />
      <PhoneSwitch group="checks" />
      {!queue.length && (
        <div className="table">
          <Empty icon="check-double" title="All employers are checked" text="New companies appear here after they send a licence." />
        </div>
      )}
      <div className="mlist">
        {queue.map((c) => {
          const owner = recruiters.find((r) => r.companyId === c.id);
          const warn = c.checks?.some((x) => x.level !== 'ok');
          return (
            <div key={c.id} className="card" style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <Link to={`/checks/employers/${c.id}`} className="row grow" style={{ gap: 14, textDecoration: 'none', minWidth: 260 }}>
                <Logo initials={c.initials} color={c.color} size={56} radius={16} />
                <div className="grow">
                  <div className="row wrap" style={{ gap: 8 }}>
                    <span style={{ fontSize: 17, fontWeight: 700 }}>{c.name}</span>
                    {warn ? <Status kind="attention" icon="alert-circle">Needs a look</Status> : <Status kind="success" icon="check">Checks passed</Status>}
                  </div>
                  <div className="cell-sub" style={{ marginTop: 4 }}>
                    {c.type} · {c.field} · {c.city} · {c.licence}
                  </div>
                  <div className="small light" style={{ marginTop: 4 }}>
                    Sent {c.submitted}
                    {owner ? ` by ${owner.name}, ${owner.title.toLowerCase()}` : ''}
                  </div>
                </div>
              </Link>
              <div className="row" style={{ gap: 8 }}>
                <Button kind="secondary" icon="cancel" onClick={() => a.reject(c)}>
                  Reject
                </Button>
                <Button kind="primary" icon="check" onClick={() => a.approve(c)}>
                  Verify
                </Button>
                <Button kind="tonal" to={`/checks/employers/${c.id}`}>
                  Open
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function VacancyChecks() {
  const { vacancies, companies } = useStore();
  const a = useVacancyActions();
  const queue = vacancies.filter((v) => v.status === 'review');
  return (
    <>
      <PageHead title="Vacancy checks" sub={queue.length ? `${queue.length} waiting · vacancies go live after approval` : 'Queue is empty'} />
      <PhoneSwitch group="checks" />
      {!queue.length && (
        <div className="table">
          <Empty icon="check-double" title="All vacancies are checked" text="New vacancies appear here as soon as employers publish them." />
        </div>
      )}
      <div className="mlist">
        {queue.map((v) => {
          const c = companies.find((x) => x.id === v.companyId);
          const issues = v.checks?.filter((x) => x.level !== 'ok') ?? [];
          return (
            <div key={v.id} className="card" style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <Link to={`/checks/vacancies/${v.id}`} className="row grow" style={{ gap: 14, textDecoration: 'none', minWidth: 260 }}>
                <img src={v.photos[0]} alt="" style={{ width: 64, height: 64, borderRadius: 16, objectFit: 'cover', flex: 'none' }} />
                <div className="grow">
                  <div className="row wrap" style={{ gap: 8 }}>
                    <span style={{ fontSize: 17, fontWeight: 700 }}>{v.title}</span>
                    {v.urgent && <Status kind="urgent" icon="flash">Urgent</Status>}
                    {issues.length ? (
                      <Status kind={issues.some((x) => x.level === 'bad') ? 'danger' : 'attention'} icon="alert-circle">
                        {issues.length === 1 ? issues[0].title : `${issues.length} issues`}
                      </Status>
                    ) : (
                      <Status kind="success" icon="check">Checks passed</Status>
                    )}
                  </div>
                  <div className="cell-sub" style={{ marginTop: 4 }}>
                    {c?.name} · {v.pay} {v.payNote.split('·')[0]} · {v.contract}
                  </div>
                  <div className="small light" style={{ marginTop: 4 }}>
                    Sent {v.posted} by {v.postedBy}
                  </div>
                </div>
              </Link>
              <div className="row" style={{ gap: 8 }}>
                <Button kind="attention" icon="message" onClick={() => a.requestChanges(v)}>
                  Changes
                </Button>
                <Button kind="primary" icon="check" onClick={() => a.approve(v)} disabled={issues.some((x) => x.level === 'bad')}>
                  Approve
                </Button>
                <Link to={`/checks/vacancies/${v.id}`} className="icon-btn" aria-label="Open">
                  <Icon name="chevron-right" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
