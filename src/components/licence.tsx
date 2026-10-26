// Trade licence: the PDF only admins see, and the decision that gives the company its verified badge.
import { useCallback, useState } from 'react';
import type { Company } from '../data/types';
import { useCompanyActions } from './actions';
import { LicenceChip } from './domain';
import { Button, Card, Icon, IconButton, KV, useEscape } from './ui';

export function PdfTile({ size = 44 }: { size?: number }) {
  return (
    <span className="check-ic" style={{ width: size, height: size * 1.15, borderRadius: 12, background: 'var(--danger-back)', color: 'var(--danger-text)', flexDirection: 'column', gap: 1 }}>
      <Icon name="file" size={Math.round(size * 0.45)} />
      <b style={{ fontSize: 9 }}>PDF</b>
    </span>
  );
}

/** PDF viewer. With the backend connected it shows the uploaded file; on mock data it shows a page placeholder. */
export function LicenceViewer({ c, onClose }: { c: Company; onClose: () => void }) {
  const close = useCallback(onClose, [onClose]);
  useEscape(close);
  const [page, setPage] = useState(1);
  const f = c.licence.file;
  if (!f) return null;
  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 720, gap: 12 }} role="dialog" aria-modal="true" aria-label={`Trade licence of ${c.name}`} onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ gap: 12 }}>
          <PdfTile size={36} />
          <div className="grow">
            <div className="strong" style={{ fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {f.name}
            </div>
            <div className="small muted">
              {c.name} · {f.size} · page {page} of {f.pages}
            </div>
          </div>
          <IconButton icon="chevron-left" label="Previous page" sm disabled={page <= 1} onClick={() => setPage(page - 1)} />
          <IconButton icon="chevron-right" label="Next page" sm disabled={page >= f.pages} onClick={() => setPage(page + 1)} />
          <IconButton icon="cancel" label="Close" sm onClick={onClose} />
        </div>
        {f.url ? (
          <iframe title={f.name} src={`${f.url}#page=${page}`} style={{ width: '100%', height: '70vh', border: 'none', borderRadius: 16, background: 'var(--back)' }} />
        ) : (
          <div style={{ background: 'var(--back)', borderRadius: 16, padding: 20, display: 'flex', justifyContent: 'center' }}>
            <div
              aria-label="Page placeholder"
              style={{
                width: '100%',
                maxWidth: 420,
                aspectRatio: '1 / 1.414',
                background: '#FFFFFF',
                borderRadius: 6,
                boxShadow: '0 6px 24px rgba(14,26,43,0.14)',
                padding: '9% 8%',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                filter: c.licence.status === 'rejected' ? 'blur(1.4px)' : undefined,
              }}>
              <div style={{ height: 14, width: '55%', borderRadius: 4, background: '#DAE1EB' }} />
              <div style={{ height: 10, width: '35%', borderRadius: 4, background: '#ECEFF4', marginBottom: 14 }} />
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} style={{ display: 'flex', gap: 10 }}>
                  <div style={{ height: 9, width: '28%', borderRadius: 4, background: '#ECEFF4' }} />
                  <div style={{ height: 9, flex: 1, borderRadius: 4, background: i % 3 === 0 ? '#DAE1EB' : '#ECEFF4' }} />
                </div>
              ))}
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ width: 64, height: 64, borderRadius: 8, background: '#ECEFF4' }} />
                <div style={{ width: 90, height: 34, borderRadius: '50%', border: '2px solid #DAE1EB' }} />
              </div>
            </div>
          </div>
        )}
        {!f.url && <div className="small muted" style={{ textAlign: 'center' }}>Mock data: the uploaded PDF opens here when the admin is connected to the backend.</div>}
      </div>
    </div>
  );
}

/** Company page card: licence status, the file, what was read from it and the decision. */
export function LicenceCard({ c }: { c: Company }) {
  const a = useCompanyActions();
  const [open, setOpen] = useState(false);
  const l = c.licence;
  return (
    <Card title="Trade licence" right={<LicenceChip s={l.status} />}>
      {l.status === 'none' ? (
        <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
          <span className="check-ic" style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--back)', color: 'var(--text-body)' }}>
            <Icon name="file" />
          </span>
          <p className="para" style={{ fontSize: 14 }}>
            {c.type === 'Private recruiter' ? 'Private recruiter, no trade licence uploaded.' : 'The company hasn’t uploaded a trade licence yet.'} It can post vacancies but has no verified badge in the app.
          </p>
        </div>
      ) : (
        <>
          {l.file && (
            <div className="row" style={{ gap: 12, padding: 12, borderRadius: 16, background: 'var(--back)' }}>
              <PdfTile />
              <span className="grow">
                <span style={{ display: 'block', fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.file.name}</span>
                <span className="small muted">
                  {l.file.size} · {l.file.pages} {l.file.pages === 1 ? 'page' : 'pages'} · sent {l.sentAt ?? '—'}
                </span>
              </span>
              <Button size="XS" icon="view" onClick={() => setOpen(true)}>
                Open PDF
              </Button>
            </div>
          )}
          {l.status === 'rejected' && l.reason && (
            <div style={{ background: 'var(--danger-back)', borderRadius: 14, padding: '10px 12px' }}>
              <div className="small strong" style={{ color: 'var(--danger-text)' }}>
                Rejected {l.checkedAt} · {l.checkedBy}
              </div>
              <div style={{ marginTop: 4, fontSize: 14, lineHeight: 1.45 }}>{l.reason}</div>
            </div>
          )}
          <KV
            rows={[
              ['Licence no.', c.licenceNo],
              ['Issued by', l.issuer ?? '—'],
              ['Activity', l.activity ?? '—'],
              ['Valid until', l.validUntil ?? '—'],
              ...(l.status === 'verified' ? ([['Approved', `${l.checkedAt} · ${l.checkedBy}`]] as [string, string][]) : []),
            ]}
          />
          {l.status === 'review' && (
            <div className="two" style={{ gap: 8 }}>
              <Button kind="danger" icon="cancel" full onClick={() => a.rejectLicence(c)}>
                Reject
              </Button>
              <Button kind="primary" icon="verified" full onClick={() => a.approveLicence(c)}>
                Approve, give badge
              </Button>
            </div>
          )}
          {l.status === 'verified' && (
            <Button kind="secondary" icon="cancel" full onClick={() => a.rejectLicence(c)}>
              Remove badge
            </Button>
          )}
        </>
      )}
      <div className="row small muted" style={{ gap: 6 }}>
        <Icon name="lock" size={14} />
        Only admins see this file. Candidates never do.
      </div>
      {open && <LicenceViewer c={c} onClose={() => setOpen(false)} />}
    </Card>
  );
}
