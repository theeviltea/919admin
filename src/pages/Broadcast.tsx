// Messaging: push notifications and email campaigns share one screen — message in two languages, audience, live reach,
// preview, a test to one device or inbox, the send to everyone, and the history with delivery numbers.
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Button, Card, Empty, Icon, PageHead, Segmented, Status } from '../components/ui';
import { useDialogs } from '../components/dialogs';
import { useAuth } from '../data/auth';
import { useStore } from '../data/store';
import { COUNTRIES, EMPTY_AUDIENCE, LIMITS, broadcast, type Audience, type Campaign, type Channel, type Lang, type Reach, type Text } from '../data/broadcast';
import { LogoMark } from '../layout/Shell';

const LANGS: { key: Lang; label: string }[] = [
  { key: 'ru', label: 'Russian' },
  { key: 'en', label: 'English' },
];
const PH: Record<Channel, Record<Lang, Text>> = {
  push: {
    ru: { title: 'Например: 919 обновилось', body: 'Что человек прочитает в уведомлении' },
    en: { title: 'For example: 919 has been updated', body: 'What the person reads in the notification' },
  },
  email: {
    ru: { title: 'Например: Новое приложение 919', body: 'Текст письма. Пустая строка — новый абзац, ссылки станут кликабельными.' },
    en: { title: 'For example: The new 919 app', body: 'The letter. A blank line starts a paragraph; links become clickable.' },
  },
};
const FOOTER: Record<Lang, [string, string]> = {
  ru: ['Вы получили это письмо, потому что зарегистрированы в 919.', 'Отписаться'],
  en: ['You got this letter because you have a 919 account.', 'Unsubscribe'],
};

const fmt = (n: number) => n.toLocaleString('en-US');
const filled = (t?: Text) => !!t && !!t.title.trim() && !!t.body.trim();
const when = (ms: number) => new Date(ms).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const took = (c: Campaign) => {
  if (!c.ended) return '';
  const s = Math.round((c.ended - c.started) / 1000);
  return s < 60 ? `${s} s` : `${Math.round(s / 60)} min`;
};

function audienceLabel(a: Audience, channel: Channel) {
  const who = a.who === 'all' ? 'Everyone' : a.who === 'seekers' ? 'Job seekers' : 'Employers';
  const parts = [who];
  if (channel === 'push' && a.app !== 'both') parts.push(a.app === 'old' ? 'old app' : 'new app');
  if (a.city || a.country) parts.push(a.city || a.country);
  if (a.lang !== 'any') parts.push(a.lang === 'ru' ? 'Russian' : 'English');
  if (a.from || a.to) parts.push(`registered ${a.from || '…'} – ${a.to || '…'}`);
  return parts.join(' · ');
}

// ---------- Message ----------

function LangEditor({ channel, lang, value, onChange }: { channel: Channel; lang: (typeof LANGS)[number]; value: Text; onChange: (t: Text) => void }) {
  const lim = LIMITS[channel];
  const ph = PH[channel][lang.key];
  const id = `${channel}-${lang.key}`;
  return (
    <div className="bc-lang">
      <div className="bc-lang-h">
        <span className="bc-code">{lang.key.toUpperCase()}</span>
        <b>{lang.label}</b>
        {filled(value) ? (
          <Status kind="success" icon="check">
            Ready
          </Status>
        ) : value.title || value.body ? (
          <Status kind="attention">Incomplete</Status>
        ) : (
          <span className="small muted">Optional if the other is filled</span>
        )}
      </div>
      <div className="field">
        <div className="bc-label">
          <label htmlFor={`${id}-t`}>{channel === 'email' ? 'Subject' : 'Title'}</label>
          <span className={`bc-count ${value.title.length > lim.title ? 'over' : ''}`}>
            {value.title.length} / {fmt(lim.title)}
          </span>
        </div>
        <input id={`${id}-t`} className="input" value={value.title} maxLength={lim.title} placeholder={ph.title} onChange={(e) => onChange({ ...value, title: e.target.value })} />
      </div>
      <div className="field">
        <div className="bc-label">
          <label htmlFor={`${id}-b`}>Text</label>
          <span className="bc-count">
            {fmt(value.body.length)} / {fmt(lim.body)}
          </span>
        </div>
        <textarea
          id={`${id}-b`}
          className="textarea"
          style={{ minHeight: channel === 'email' ? 220 : 110 }}
          value={value.body}
          maxLength={lim.body}
          placeholder={ph.body}
          onChange={(e) => onChange({ ...value, body: e.target.value })}
        />
      </div>
    </div>
  );
}

// ---------- Audience ----------

function Field({ label, htmlFor, hint, children }: { label: string; htmlFor?: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <span className="bc-hint">{hint}</span>}
    </div>
  );
}

function AudienceCard({ channel, a, set, reach }: { channel: Channel; a: Audience; set: (a: Audience) => void; reach: Reach | null }) {
  const cities = a.country ? COUNTRIES[a.country] ?? [] : [];
  const pct = reach && reach.match ? Math.max(2, Math.round((reach.reach / reach.match) * 100)) : 0;
  const changed = JSON.stringify(a) !== JSON.stringify(EMPTY_AUDIENCE);
  return (
    <Card
      title="Audience"
      right={
        changed ? (
          <button type="button" className="bc-link" onClick={() => set(EMPTY_AUDIENCE)}>
            Reset filters
          </button>
        ) : undefined
      }
      gap={16}
    >
      <Field label="Who">
        <Segmented
          items={[
            { key: 'all', label: 'Everyone' },
            { key: 'seekers', label: 'Job seekers' },
            { key: 'employers', label: 'Employers' },
          ]}
          value={a.who}
          onChange={(who) => set({ ...a, who })}
        />
      </Field>
      {channel === 'push' && (
        <Field label="App" hint="Old app: the device token came from the old store app. New app: the token was sent by the new app.">
          <Segmented
            items={[
              { key: 'both', label: 'Both' },
              { key: 'old', label: 'Old app' },
              { key: 'new', label: 'New app' },
            ]}
            value={a.app}
            onChange={(app) => set({ ...a, app })}
          />
        </Field>
      )}
      <div className="two">
        <Field label="Country" htmlFor={`${channel}-country`} hint="Many old accounts have no country, so a country filter leaves them out.">
          <span className="bc-select">
            <select id={`${channel}-country`} className="input" value={a.country} onChange={(e) => set({ ...a, country: e.target.value, city: '' })}>
              <option value="">Any country</option>
              {Object.keys(COUNTRIES).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <Icon name="chevron-down" size={18} />
          </span>
        </Field>
        <Field label="City" htmlFor={`${channel}-city`} hint={a.country ? undefined : 'Pick a country first.'}>
          <span className="bc-select">
            <select id={`${channel}-city`} className="input" value={a.city} disabled={!a.country} onChange={(e) => set({ ...a, city: e.target.value })}>
              <option value="">Any city</option>
              {cities.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <Icon name="chevron-down" size={18} />
          </span>
        </Field>
      </div>
      <div className="two">
        <Field label="Registered from" htmlFor={`${channel}-from`}>
          <input id={`${channel}-from`} type="date" className="input" value={a.from} max={a.to || undefined} onChange={(e) => set({ ...a, from: e.target.value })} />
        </Field>
        <Field label="Registered to" htmlFor={`${channel}-to`} hint="Both days included, UTC.">
          <input id={`${channel}-to`} type="date" className="input" value={a.to} min={a.from || undefined} onChange={(e) => set({ ...a, to: e.target.value })} />
        </Field>
      </div>
      <Field label="Account language">
        <Segmented
          items={[
            { key: 'any', label: 'Any' },
            { key: 'ru', label: 'Russian' },
            { key: 'en', label: 'English' },
          ]}
          value={a.lang}
          onChange={(lang) => set({ ...a, lang })}
        />
      </Field>
      <div className="bc-reach">
        {reach ? (
          <>
            <div className="bc-reach-row">
              <span>
                <b>{fmt(reach.match)}</b> people match
              </span>
              <span>
                <b style={{ color: 'var(--success-text)' }}>{fmt(reach.reach)}</b> {channel === 'push' ? 'have notifications on' : 'have an email address'}
              </span>
            </div>
            <span className="bc-bar">
              <span style={{ width: `${pct}%` }} />
            </span>
          </>
        ) : (
          <span className="small muted">Counting…</span>
        )}
      </div>
    </Card>
  );
}

// ---------- Preview ----------

function PushPreview({ t, ph }: { t: Text; ph: Text }) {
  return (
    <div className="bc-lock">
      <div className="bc-lock-time">19:17</div>
      <div className="bc-lock-date">Wednesday, 4 November</div>
      <div className="bc-notif">
        <LogoMark size={38} />
        <div className="grow" style={{ minWidth: 0 }}>
          <div className="bc-notif-top">
            <span>919</span>
            <span>now</span>
          </div>
          <div className={`bc-notif-t ${t.title ? '' : 'ph'}`}>{t.title || 'Title'}</div>
          <div className={`bc-notif-b ${t.body ? '' : 'ph'}`}>{t.body || ph.body}</div>
        </div>
      </div>
    </div>
  );
}

/** Same rules as the server: a blank line starts a paragraph, links become clickable. */
function Letter({ body }: { body: string }) {
  const paras = body.split(/\n\s*\n/).filter((p) => p.trim());
  return (
    <>
      {paras.map((p, i) => (
        <p key={i}>
          {p.split(/(https?:\/\/\S+)/g).map((s, k) =>
            /^https?:\/\//.test(s) ? (
              <a key={k} href={s} target="_blank" rel="noreferrer">
                {s}
              </a>
            ) : (
              <span key={k}>{s}</span>
            ),
          )}
        </p>
      ))}
    </>
  );
}

function EmailPreview({ t, lang, from }: { t: Text; lang: Lang; from: string }) {
  const [foot, unsub] = FOOTER[lang];
  return (
    <div className="bc-mail">
      <div className="bc-mail-h">
        <LogoMark size={36} />
        <div className="grow" style={{ minWidth: 0 }}>
          <div className={`bc-mail-s ${t.title ? '' : 'ph'}`}>{t.title || 'Subject'}</div>
          <div className="small muted">{from || 'The sender set on the server'}</div>
        </div>
      </div>
      <div className="bc-mail-b">{t.body.trim() ? <Letter body={t.body} /> : <p className="ph">Text of the letter</p>}</div>
      <div className="bc-mail-f">
        {foot} <u>{unsub}</u>
      </div>
    </div>
  );
}

// ---------- History ----------

function Progress({ c }: { c: Campaign }) {
  const done = c.sent + c.gone + c.failed;
  const w = (n: number) => `${(n / Math.max(1, c.total)) * 100}%`;
  return (
    <div className="bc-prog">
      <div>
        <b>{fmt(c.sent)}</b> <span className="muted">delivered of {fmt(c.total)}</span>
      </div>
      <span className="bc-bar multi" title={`${fmt(done)} of ${fmt(c.total)} processed`}>
        <span style={{ width: w(c.sent), background: 'var(--success-strong)' }} />
        <span style={{ width: w(c.gone), background: 'var(--text-light-secondary)' }} />
        <span style={{ width: w(c.failed), background: 'var(--danger-text)' }} />
      </span>
      <div className="small">
        {c.gone > 0 && <span className="muted">{fmt(c.gone)} no longer installed</span>}
        {c.gone > 0 && c.failed > 0 && <span className="muted"> · </span>}
        {c.failed > 0 && <span style={{ color: 'var(--danger-text)', fontWeight: 600 }}>{fmt(c.failed)} failed</span>}
      </div>
      {c.error && c.failed > 0 && <div className="bc-err">{c.error}</div>}
    </div>
  );
}

function History({ channel, items }: { channel: Channel; items: Campaign[] }) {
  return (
    <Card title="History" count={items.length || undefined} gap={0}>
      {!items.length ? (
        <Empty
          icon={channel === 'push' ? 'notification' : 'mail'}
          title={channel === 'push' ? 'No notifications sent yet' : 'No email campaigns yet'}
          text={`${channel === 'push' ? 'Notifications' : 'Campaigns'} sent to everyone appear here with their delivery progress.`}
        />
      ) : (
        <div className="bc-hist">
          <div className="bc-hist-row head hide-m">
            <span>Status</span>
            <span>Message</span>
            <span>Audience</span>
            <span>Delivery</span>
            <span>Sent</span>
          </div>
          {items.map((c) => (
            <div key={c.id} className="bc-hist-row">
              <span>
                {c.status === 'sending' ? (
                  <Status kind="new" icon="clock">
                    Sending
                  </Status>
                ) : c.status === 'failed' ? (
                  <Status kind="danger" icon="alert-circle">
                    Failed
                  </Status>
                ) : c.failed ? (
                  <Status kind="attention" icon="check">
                    Done with errors
                  </Status>
                ) : (
                  <Status kind="success" icon="check">
                    Done
                  </Status>
                )}
              </span>
              <div className="bc-msg">
                {LANGS.map(
                  (l) =>
                    c.text[l.key] && (
                      <div key={l.key}>
                        <div className="bc-msg-t">
                          <span className="bc-code sm">{l.key.toUpperCase()}</span>
                          {c.text[l.key]!.title}
                        </div>
                        <div className="bc-msg-b">{c.text[l.key]!.body}</div>
                      </div>
                    ),
                )}
              </div>
              <span className="small">{audienceLabel(c.audience, channel)}</span>
              <Progress c={c} />
              <div className="small">
                <div style={{ fontWeight: 700, color: 'var(--text-headline)' }}>{c.by}</div>
                <div className="muted">{when(c.started)}</div>
                {c.ended && <div className="muted">took {took(c)}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ---------- Page ----------

export default function Broadcast({ channel }: { channel: Channel }) {
  const { ask } = useDialogs();
  const { notify } = useStore();
  const { user } = useAuth();
  const [text, setText] = useState<Record<Lang, Text>>({ ru: { title: '', body: '' }, en: { title: '', body: '' } });
  const [aud, setAud] = useState<Audience>(EMPTY_AUDIENCE);
  const [reach, setReach] = useState<Reach | null>(null);
  const [view, setView] = useState<Lang>('ru');
  const [hist, setHist] = useState<Campaign[]>([]);
  const [mail, setMail] = useState<{ configured: boolean; from: string } | null>(channel === 'push' ? { configured: true, from: '' } : null);
  const [testTo, setTestTo] = useState(user?.email ?? '');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    broadcast.history(channel).then(setHist).catch(() => setHist([]));
    if (channel === 'email') broadcast.mail().then(setMail).catch(() => setMail({ configured: false, from: '' }));
  }, [channel]);

  // Reach follows the filters; a short delay keeps typing in dates from firing a request per keystroke.
  useEffect(() => {
    setReach(null);
    const t = window.setTimeout(() => broadcast.reach(channel, aud).then(setReach).catch(() => setReach(null)), 250);
    return () => window.clearTimeout(t);
  }, [channel, aud]);

  // Mock delivery: a campaign in "sending" fills up over a few seconds.
  const sending = hist.some((h) => h.status === 'sending');
  useEffect(() => {
    if (!sending) return;
    const t = window.setInterval(() => {
      setHist((hs) =>
        hs.map((h) => {
          if (h.status !== 'sending') return h;
          const step = Math.ceil(h.total / 6);
          const sent = Math.min(h.total - h.gone - h.failed, h.sent + step);
          const finished = sent + h.gone + h.failed >= h.total;
          return { ...h, sent, ...(finished ? { status: 'done' as const, ended: Date.now() } : {}) };
        }),
      );
    }, 700);
    return () => window.clearInterval(t);
  }, [sending]);

  const ready = LANGS.filter((l) => filled(text[l.key]));
  const partial = LANGS.some((l) => (text[l.key].title || text[l.key].body) && !filled(text[l.key]));
  const shownLang: Lang = filled(text[view]) || !ready.length ? view : ready[0].key;
  const serverOk = !!mail?.configured;
  const blocker = !serverOk
    ? 'Set up the mail server first.'
    : !ready.length
      ? 'Write the title and text in at least one language.'
      : partial
        ? 'Finish the language you started, or clear it.'
        : !reach
          ? 'Counting the audience…'
          : reach.reach === 0
            ? 'No one matches these filters.'
            : null;
  const note = ready.length === 1 ? `Everyone gets the ${ready[0].label} text.` : 'Each person gets the language of their account.';
  const payload = useMemo(() => Object.fromEntries(ready.map((l) => [l.key, text[l.key]])) as Partial<Record<Lang, Text>>, [ready, text]);

  const sendTest = async () => {
    if (!testTo.trim()) return;
    setTesting(true);
    try {
      await broadcast.test(channel, testTo.trim(), payload, shownLang);
      notify(`Test sent to ${testTo.trim()}`);
    } catch {
      notify('The test didn’t go through. Try again.');
    } finally {
      setTesting(false);
    }
  };

  const sendAll = () => {
    if (blocker || !reach) return;
    ask({
      title: channel === 'push' ? 'Send this notification?' : 'Send this letter?',
      icon: channel === 'push' ? 'notification' : 'mail',
      tone: 'primary',
      text: (
        <>
          <b>{fmt(reach.reach)}</b> people get it now · {audienceLabel(aud, channel)}. {note} It can’t be called back once it’s sent.
        </>
      ),
      confirm: `Send to ${fmt(reach.reach)}`,
      onConfirm: async () => {
        const c: Campaign = {
          id: `c${Date.now()}`,
          channel,
          status: 'sending',
          text: payload,
          audience: aud,
          total: reach.reach,
          sent: 0,
          gone: Math.round(reach.reach * 0.002),
          failed: 0,
          by: user?.name ?? 'Admin',
          started: Date.now(),
        };
        try {
          const real = await broadcast.send(channel, payload, aud);
          setHist((h) => [real ?? c, ...h]);
          setText({ ru: { title: '', body: '' }, en: { title: '', body: '' } });
          notify(channel === 'push' ? 'Sending the notification' : 'Sending the letters');
        } catch {
          notify('Couldn’t start sending. Nothing was sent; try again.');
        }
      },
    });
  };

  const isPush = channel === 'push';
  return (
    <>
      <PageHead
        title={isPush ? 'Push notifications' : 'Email campaigns'}
        sub={isPush ? 'A notification to everyone who matches, or a test to one phone first' : 'A letter to everyone who matches and has an address, or a test to one inbox first'}
      />
      <div className="bc">
        <div className="bc-main">
          <Card title={isPush ? 'Message' : 'Letter'} gap={16}>
            <div className="bc-langs">
              {LANGS.map((l) => (
                <LangEditor key={l.key} channel={channel} lang={l} value={text[l.key]} onChange={(t) => setText({ ...text, [l.key]: t })} />
              ))}
            </div>
            <div className="bc-note">
              <Icon name="globe" size={16} />
              <span>
                Each person gets the language of their account. If one language is left empty, everyone gets the other.
                {!isPush && ' The server adds a footer with an unsubscribe link.'}
              </span>
            </div>
          </Card>
          <AudienceCard channel={channel} a={aud} set={setAud} reach={reach} />
        </div>

        <aside className="bc-side">
          {!isPush && mail && !mail.configured && (
            <div className="bc-warn" role="status">
              <Icon name="alert-circle" size={20} />
              <div>
                <b>No mail server yet</b>
                <p>
                  Letters go over SMTP. The server needs <code>SMTP_HOST</code>, <code>SMTP_USER</code>, <code>SMTP_PASSWORD</code> and <code>SMTP_FROM</code> (for Gmail: smtp.gmail.com and an
                  app password). Until then nothing can be sent.
                </p>
              </div>
            </div>
          )}

          <Card title="Preview" gap={14}>
            <Segmented
              items={LANGS.map((l) => ({ key: l.key, label: filled(text[l.key]) ? `${l.label} ✓` : l.label }))}
              value={view}
              onChange={setView}
            />
            {isPush ? <PushPreview t={text[view]} ph={PH.push[view]} /> : <EmailPreview t={text[view]} lang={view} from={mail?.from ?? ''} />}
            {view !== shownLang && <span className="bc-hint">{LANGS.find((l) => l.key === view)!.label} is empty, so these people get the {LANGS.find((l) => l.key === shownLang)!.label} text.</span>}
          </Card>

          <Card title="Test send" gap={12}>
            <span className="bc-hint" style={{ marginTop: -4 }}>
              {isPush ? 'Send it to one phone first: yours, or a colleague’s with another phone model.' : 'Send it to one inbox first: yours, or a Gmail and a Mail.ru box to check both.'}
            </span>
            <Field label={isPush ? 'Account email or ID' : 'Address'} htmlFor={`${channel}-test`}>
              <input id={`${channel}-test`} className="input" value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder={isPush ? 'admin@919app.net' : 'name@gmail.com'} />
            </Field>
            <Button kind="secondary" icon={isPush ? 'notification' : 'mail'} full disabled={!testTo.trim() || !ready.length || !serverOk || testing} onClick={sendTest}>
              {testing ? 'Sending…' : `Send test in ${LANGS.find((l) => l.key === shownLang)!.label}`}
            </Button>
          </Card>

          <Card title="Send to everyone" gap={12}>
            <div className="bc-big">
              <span className="kpi-v">{reach ? fmt(reach.reach) : '—'}</span>
              <span className="small muted">{isPush ? 'phones get it' : 'inboxes get it'}</span>
            </div>
            <Button kind="primary" size="L" icon={isPush ? 'notification' : 'mail'} full disabled={!!blocker} onClick={sendAll}>
              Send to everyone
            </Button>
            <span className="bc-hint">{blocker ?? note}</span>
          </Card>
        </aside>
      </div>
      <History channel={channel} items={hist} />
    </>
  );
}
