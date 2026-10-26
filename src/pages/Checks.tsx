// Moderation queues: new employers and vacancies waiting for a decision.
import { Link } from '../lib/links';
import { useCompanyActions, useVacancyActions } from '../components/actions';
import { useState } from 'react';
import { CompanyStatusChip, LicenceChip, PhoneSwitch } from '../components/domain';
import { LicenceViewer, PdfTile } from '../components/licence';
import { Button, Empty, Icon, Logo, PageHead, Segmented, Status } from '../components/ui';
import { useStore } from '../data/store';
import type { Company } from '../data/types';

export function EmployerChecks() {
  const { companies, recruiters, counts } = useStore();
  const a = useCompanyActions();
  const [tab, setTab] = useState<'new' | 'licences'>(() => (counts.newCompanies ? 'new' : 'licences'));
  const [viewer, setViewer] = useState<Company | null>(null);
  const queue = companies.filter((c) => c.status === 'pending');
  const licences = companies.filter((c) => c.licence.status === 'review');
  return (
    <>
      <PageHead
        title="Employer checks"
        sub={counts.employers ? `${queue.length} new companies · ${licences.length} trade licences · we answer within 24 hours` : 'Queue is empty'}
      />
      <PhoneSwitch group="checks" />
      <Segmented
        items={[
          { key: 'new', label: 'New companies', count: queue.length },
          { key: 'licences', label: 'Trade licences', count: licences.length },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'new' ? (
        <>
          {!queue.length && (
            <div className="table">
              <Empty icon="check-double" title="All new companies are checked" text="Companies appear here right after sign-up." />
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
                        <LicenceChip s={c.licence.status} />
                      </div>
                      <div className="cell-sub" style={{ marginTop: 4 }}>
                        {c.type} · {c.field} · {c.city} · {c.licenceNo}
                      </div>
                      <div className="small light" style={{ marginTop: 4 }}>
                        Sent {c.submitted}
                        {owner ? ` by ${owner.name}, ${owner.title.toLowerCase()}` : ''}
                      </div>
                    </div>
                  </Link>
                  <div className="row queue-actions" style={{ gap: 8 }}>
                    <Button kind="secondary" icon="cancel" onClick={() => a.reject(c)}>
                      Reject
                    </Button>
                    <Button kind="primary" icon="check" onClick={() => a.approve(c)}>
                      Approve
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
      ) : (
        <>
          {!licences.length && (
            <div className="table">
              <Empty icon="verified" title="No trade licences to check" text="When a company uploads its trade licence, it appears here. Approved licences give the verified badge." />
            </div>
          )}
          <div className="mlist">
            {licences.map((c) => (
              <div key={c.id} className="card" style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <Link to={`/checks/employers/${c.id}`} className="row grow" style={{ gap: 14, textDecoration: 'none', minWidth: 260 }}>
                  <Logo initials={c.initials} color={c.color} size={56} radius={16} />
                  <div className="grow">
                    <div className="row wrap" style={{ gap: 8 }}>
                      <span style={{ fontSize: 17, fontWeight: 700 }}>{c.name}</span>
                      <CompanyStatusChip s={c.status} />
                    </div>
                    <div className="row" style={{ gap: 8, marginTop: 6 }}>
                      <PdfTile size={28} />
                      <span className="cell-sub" style={{ marginTop: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.licence.file?.name} · {c.licence.file?.size}
                      </span>
                    </div>
                    <div className="small light" style={{ marginTop: 4 }}>
                      {c.licenceNo} · sent {c.licence.sentAt}
                    </div>
                  </div>
                </Link>
                <div className="row queue-actions" style={{ gap: 8 }}>
                  <Button kind="secondary" icon="view" onClick={() => setViewer(c)}>
                    Open PDF
                  </Button>
                  <Button kind="danger" icon="cancel" onClick={() => a.rejectLicence(c)}>
                    Reject
                  </Button>
                  <Button kind="primary" icon="verified" onClick={() => a.approveLicence(c)}>
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {viewer && <LicenceViewer c={viewer} onClose={() => setViewer(null)} />}
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
