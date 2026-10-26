// Design-system atoms for the admin (same look as the 919 app components).
import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import icons from '../lib/icons.json';
import type { Check, Frame, LogItem, Tier } from '../data/types';

export type IconName = keyof typeof icons;

export function Icon({ name, size = 20, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      style={{ flex: 'none' }}
      dangerouslySetInnerHTML={{ __html: icons[name] }}
    />
  );
}

type BtnKind = 'primary' | 'secondary' | 'tonal' | 'danger' | 'attention' | 'inverse' | 'success' | 'dangerSolid';
export function Button({
  children,
  kind = 'secondary',
  size,
  icon,
  full,
  onClick,
  disabled,
  to,
  type = 'button',
}: {
  children: ReactNode;
  kind?: BtnKind;
  size?: 'L' | 'XS';
  icon?: IconName;
  full?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  to?: string;
  type?: 'button' | 'submit';
}) {
  const cls = `btn ${kind} ${size ?? ''} ${full ? 'full' : ''}`;
  const inner = (
    <>
      {icon && <Icon name={icon} size={size === 'XS' ? 16 : 18} />}
      {children}
    </>
  );
  if (to)
    return (
      <Link className={cls} to={to}>
        {inner}
      </Link>
    );
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {inner}
    </button>
  );
}

export function IconButton({ icon, label, onClick, sm, to, disabled }: { icon: IconName; label: string; onClick?: () => void; sm?: boolean; to?: string; disabled?: boolean }) {
  if (to)
    return (
      <Link className={`icon-btn ${sm ? 'sm' : ''}`} to={to} aria-label={label} title={label}>
        <Icon name={icon} />
      </Link>
    );
  return (
    <button type="button" className={`icon-btn ${sm ? 'sm' : ''}`} onClick={onClick} aria-label={label} title={label} disabled={disabled}>
      <Icon name={icon} />
    </button>
  );
}

export type StatusKind = 'success' | 'pending' | 'closed' | 'attention' | 'danger' | 'premium' | 'new' | 'urgent';
export function Status({ kind, children, icon }: { kind: StatusKind; children: ReactNode; icon?: IconName }) {
  return (
    <span className={`status st-${kind}`}>
      {icon && <Icon name={icon} size={14} />}
      {children}
    </span>
  );
}

export function Chip({ label, count, on, onClick }: { label: string; count?: number | string; on?: boolean; onClick?: () => void }) {
  return (
    <button type="button" className={`chip ${on ? 'on' : ''}`} onClick={onClick} aria-pressed={on}>
      {label}
      {count !== undefined && <span className="n">{count}</span>}
    </button>
  );
}

const STAR = 'M12 4.6l2.2 4.5 4.9.7-3.6 3.5.9 4.9L12 15.9l-4.4 2.3.9-4.9-3.6-3.5 4.9-.7L12 4.6Z';
/** Star-in-circle tier badge: blue = Premium, gold = Max. Same component as in the app. */
export function TierBadge({ tier, size = 18 }: { tier: Tier; size?: number }) {
  if (tier === 'free') return null;
  const s = Math.round(size * 0.62);
  return (
    <span className={`tier ${tier}`} role="img" aria-label={tier === 'max' ? 'Max' : 'Premium'} title={tier === 'max' ? 'Max' : 'Premium'} style={{ width: size, height: size }}>
      <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true">
        <path d={STAR} fill="currentColor" />
      </svg>
    </span>
  );
}

export const FRAMES: Record<Frame, string> = {
  neon: 'conic-gradient(from 200deg, #FF1E54, #7A3FD1, #3589F2, #FF1E54)',
  gold: 'conic-gradient(from 200deg, #FFD84D, #FF9F1A, #FFE9A8, #FFD84D)',
  ocean: 'conic-gradient(from 200deg, #00C2FF, #3589F2, #00E0B8, #00C2FF)',
};

export function Avatar({ src, size = 40, frame, radius }: { src: string; size?: number; frame?: Frame; radius?: number }) {
  if (frame)
    return (
      <span className="ava-ring" style={{ width: size, height: size, padding: Math.max(2, Math.round(size / 18)), background: FRAMES[frame] }}>
        <img src={src} alt="" />
      </span>
    );
  return <img className="ava" src={src} alt="" style={{ width: size, height: size, borderRadius: radius ?? '50%' }} />;
}

export function Logo({ initials, color, size = 40, radius = 12 }: { initials: string; color: string; size?: number; radius?: number }) {
  return (
    <span className="logo" style={{ width: size, height: size, borderRadius: radius, background: color, fontSize: Math.round(size * 0.36) }}>
      {initials}
    </span>
  );
}

export function Verified() {
  return (
    <span title="Verified company" style={{ color: 'var(--primary)', display: 'inline-flex' }}>
      <Icon name="verified" size={16} />
    </span>
  );
}

export function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="search">
      <Icon name="search" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
      {value && (
        <button type="button" onClick={() => onChange('')} aria-label="Clear search" style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: 'inherit', display: 'flex' }}>
          <Icon name="cancel" size={18} />
        </button>
      )}
    </label>
  );
}

export function Segmented<T extends string>({ items, value, onChange }: { items: { key: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="seg" role="tablist">
      {items.map((it) => (
        <button key={it.key} type="button" role="tab" aria-selected={it.key === value} className={it.key === value ? 'on' : ''} onClick={() => onChange(it.key)}>
          {it.label}
          {it.count !== undefined && <span className="n">{it.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Completeness({ value }: { value: number }) {
  const col = value >= 90 ? 'var(--success-text)' : value >= 60 ? 'var(--attention-text)' : 'var(--danger-text)';
  const bar = value >= 90 ? '#34C759' : value >= 60 ? '#FFB800' : '#E0123F';
  return (
    <div className="row">
      <span className="bar">
        <span style={{ width: `${value}%`, background: bar }} />
      </span>
      <span className="small" style={{ fontWeight: 600, color: col }}>
        {value}%
      </span>
    </div>
  );
}

export function Card({ title, count, right, children, gap = 12 }: { title?: ReactNode; count?: number | string; right?: ReactNode; children: ReactNode; gap?: number }) {
  return (
    <section className="card" style={{ gap }}>
      {(title || right) && (
        <div className="card-h">
          <h2>
            {title}
            {count !== undefined && <span className="n"> {count}</span>}
          </h2>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

export function KV({ rows }: { rows: [ReactNode, ReactNode][] }) {
  return (
    <div>
      {rows.map(([k, v], i) => (
        <div className="kv-row" key={i}>
          <span>{k}</span>
          <span>{v}</span>
        </div>
      ))}
    </div>
  );
}

export function Tags({ items, blue }: { items: string[]; blue?: boolean }) {
  return (
    <div className="tags">
      {items.map((t) => (
        <span key={t} className={`tag ${blue ? 'blue' : ''}`}>
          {t}
        </span>
      ))}
    </div>
  );
}

export function Timeline({ items }: { items: [string, string, string][] }) {
  return (
    <div>
      {items.map(([a, b, c], i) => (
        <div className="timeline-item" key={i}>
          <span className="dot" />
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{a}</div>
            <div style={{ marginTop: 2, color: 'var(--text-primary)' }}>{b}</div>
            <div className="small muted" style={{ marginTop: 2 }}>
              {c}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Audit({ items }: { items: LogItem[] }) {
  return (
    <div className="audit">
      {items.map((l, i) => (
        <div key={i}>
          <span>{l.at}</span>
          <span>{l.text}</span>
        </div>
      ))}
    </div>
  );
}

export function Checks({ items }: { items: Check[] }) {
  const map = {
    ok: ['var(--success-back)', 'var(--success-text)', 'check'],
    warn: ['var(--attention-back)', 'var(--attention-text)', 'alert-circle'],
    bad: ['var(--danger-back)', 'var(--danger-text)', 'alert-circle'],
  } as const;
  return (
    <div>
      {items.map((c, i) => {
        const [bg, fg, ic] = map[c.level];
        return (
          <div className="check-row" key={i}>
            <span className="check-ic" style={{ background: bg, color: fg }}>
              <Icon name={ic} size={16} />
            </span>
            <div className="grow">
              <div style={{ fontSize: 14, fontWeight: 700 }}>{c.title}</div>
              <div className="small muted" style={{ marginTop: 2 }}>
                {c.note}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const CROPS = ['center 20%', '30% 15%', '70% 40%', 'center 60%', '20% 30%', '80% 20%', 'center 35%', 'center 10%', '40% 50%', '60% 25%', 'center 45%', '25% 60%', '75% 35%', 'center 30%'];
export function Gallery({ photos }: { photos: string[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <div className="gallery">
        {photos.map((p, i) => (
          <button type="button" key={i} onClick={() => setOpen(i)} aria-label={`Open photo ${i + 1}`}>
            <img src={p} alt="" style={{ objectPosition: CROPS[i % CROPS.length] }} loading="lazy" />
          </button>
        ))}
      </div>
      {open !== null && <Lightbox src={photos[open]} pos={CROPS[open % CROPS.length]} onClose={() => setOpen(null)} />}
    </>
  );
}

export function Lightbox({ src, pos, onClose }: { src: string; pos?: string; onClose: () => void }) {
  useEscape(onClose);
  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-label="Photo">
      <img src={src} alt="" style={{ objectPosition: pos }} />
      <IconButton icon="cancel" label="Close" onClick={onClose} />
    </div>
  );
}

export function Videos({ items }: { items: { title: string; duration: string; views: string; poster: string }[] }) {
  return (
    <div className="videos">
      {items.map((v, i) => (
        <div key={i} className="col" style={{ gap: 6 }}>
          <div className="video">
            <img src={v.poster} alt="" style={{ objectPosition: CROPS[(i * 3) % CROPS.length] }} />
            <span className="play">
              <Icon name="play-filled" size={20} />
            </span>
            <span className="dur">{v.duration}</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{v.title}</div>
          <div className="small muted">{v.views}</div>
        </div>
      ))}
    </div>
  );
}

export function Toolbar({
  crumbs,
  lead,
  title,
  chips,
  sub,
  actions,
  pos,
}: {
  crumbs: { label: string; to?: string }[];
  lead?: ReactNode;
  title: ReactNode;
  chips?: ReactNode;
  sub?: ReactNode;
  actions: ReactNode;
  pos?: { label: string; prev?: string; next?: string };
}) {
  const back = crumbs.length > 1 ? crumbs[crumbs.length - 2].to : undefined;
  return (
    <header className="toolbar">
      <div className="row" style={{ gap: 10 }}>
        <IconButton icon="arrow-left" label="Back" sm to={back ?? '/'} />
        <nav aria-label="Breadcrumb" className="crumbs">
          {crumbs.map((c, i) =>
            i < crumbs.length - 1 ? (
              <span key={i}>
                <Link to={c.to ?? '/'}>{c.label}</Link>
                <span className="sep">/</span>
              </span>
            ) : (
              <b key={i}>{c.label}</b>
            ),
          )}
        </nav>
        {pos && (
          <div className="row hide-m small muted" style={{ gap: 6 }}>
            {pos.label}
            <IconButton icon="chevron-left" label="Previous" sm to={pos.prev} disabled={!pos.prev} />
            <IconButton icon="chevron-right" label="Next" sm to={pos.next} disabled={!pos.next} />
          </div>
        )}
      </div>
      <div className="tb-main">
        {lead}
        <div className="grow">
          <h1 className="tb-title">{title}</h1>
          <div className="row wrap" style={{ marginTop: 6 }}>
            {chips}
            {sub && <span className="muted" style={{ fontSize: 14 }}>{sub}</span>}
          </div>
        </div>
        <div role="toolbar" aria-label="Manage" className="tb-actions">
          {actions}
        </div>
      </div>
    </header>
  );
}

export function PageHead({ title, sub, right }: { title: string; sub?: ReactNode; right?: ReactNode }) {
  return (
    <header className="topbar">
      <div className="topbar-title">
        <h1 className="h1">{title}</h1>
        {sub && <div className="sub">{sub}</div>}
      </div>
      {right}
    </header>
  );
}

export function Empty({ icon = 'search', title, text }: { icon?: IconName; title: string; text?: string }) {
  return (
    <div className="empty">
      <span className="check-ic" style={{ width: 56, height: 56, background: 'var(--back)', color: 'var(--text-body)', borderRadius: 18 }}>
        <Icon name={icon} size={24} />
      </span>
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-headline)' }}>{title}</div>
      {text && <div style={{ maxWidth: 360 }}>{text}</div>}
    </div>
  );
}

export function useEscape(fn: () => void) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && fn();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [fn]);
}

export function useIsMobile() {
  const q = '(max-width: 860px)';
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const h = () => setM(mq.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return m;
}

export function Pager({ shown, total }: { shown: number; total: string }) {
  return (
    <div className="pager">
      <span>
        Showing {shown} of {total}
      </span>
      <div className="row">
        <IconButton icon="chevron-left" label="Previous page" sm disabled />
        <span className="strong" style={{ color: 'var(--text-headline)' }}>
          1
        </span>
        <IconButton icon="chevron-right" label="Next page" sm />
      </div>
    </div>
  );
}

export function Checkbox({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      aria-label={label}
      className={`checkbox ${on ? 'on' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
    >
      {on && <Icon name="check" size={14} />}
    </button>
  );
}
