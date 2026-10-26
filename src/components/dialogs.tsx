// Confirm / reason / type-to-confirm / edit dialogs, opened from anywhere with useDialogs().
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useStore } from '../data/store';
import { Button, Icon, useEscape, type IconName } from './ui';

export type Ask = {
  title: string;
  text?: ReactNode;
  icon?: IconName;
  tone?: 'danger' | 'attention' | 'primary' | 'success';
  confirm: string;
  reasons?: string[];
  note?: { label: string; placeholder?: string; required?: boolean; initial?: string };
  typeToConfirm?: string;
  onConfirm: (r: { reason?: string; note?: string }) => void;
};
export type EditField = { key: string; label: string; value: string; multiline?: boolean };
export type EditReq = { title: string; fields: EditField[]; onSave: (v: Record<string, string>) => void };

const Ctx = createContext<{ ask: (a: Ask) => void; edit: (e: EditReq) => void } | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [ask, setAsk] = useState<Ask | null>(null);
  const [edit, setEdit] = useState<EditReq | null>(null);
  const store = useStore();
  const open = !!ask || !!edit;
  useEffect(() => {
    document.body.classList.toggle('modal-open', open);
  }, [open]);
  return (
    <Ctx.Provider value={{ ask: setAsk, edit: setEdit }}>
      {children}
      {ask && <AskDialog a={ask} onClose={() => setAsk(null)} />}
      {edit && <EditDialog e={edit} onClose={() => setEdit(null)} />}
      {store.toast && (
        <div className="toast" role="status" key={store.toast.id}>
          <Icon name="check" size={18} />
          <span>{store.toast.text}</span>
          {store.toast.undo && (
            <button
              type="button"
              onClick={() => {
                store.toast?.undo?.();
                store.dismissToast();
              }}
            >
              Undo
            </button>
          )}
        </div>
      )}
    </Ctx.Provider>
  );
}

export function useDialogs() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useDialogs outside DialogProvider');
  return v;
}

const TONES = {
  danger: ['var(--danger-back)', 'var(--danger-text)', 'dangerSolid'],
  attention: ['var(--attention-back)', 'var(--attention-text)', 'inverse'],
  primary: ['var(--primary-secondary)', 'var(--primary)', 'primary'],
  success: ['var(--success-back)', 'var(--success-text)', 'primary'],
} as const;

function AskDialog({ a, onClose }: { a: Ask; onClose: () => void }) {
  const [reason, setReason] = useState(a.reasons?.[0]);
  const [note, setNote] = useState(a.note?.initial ?? '');
  const [typed, setTyped] = useState('');
  const close = useCallback(onClose, [onClose]);
  useEscape(close);
  const [bg, fg, btn] = TONES[a.tone ?? 'primary'];
  const blocked = (a.typeToConfirm && typed.trim() !== a.typeToConfirm) || (a.note?.required && !note.trim());
  return (
    <div className="scrim" onClick={onClose}>
      <form
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={a.title}
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          if (blocked) return;
          a.onConfirm({ reason, note: note.trim() || undefined });
          onClose();
        }}
      >
        <span className="modal-ic" style={{ background: bg, color: fg }}>
          <Icon name={a.icon ?? 'alert-circle'} size={26} />
        </span>
        <h2>{a.title}</h2>
        {a.text && <div className="para" style={{ fontSize: 15 }}>{a.text}</div>}
        {a.reasons && (
          <div className="col" style={{ gap: 8 }} role="radiogroup" aria-label="Reason">
            {a.reasons.map((r) => (
              <button type="button" key={r} role="radio" aria-checked={reason === r} className={`reason ${reason === r ? 'on' : ''}`} onClick={() => setReason(r)}>
                <span className="radio" />
                {r}
              </button>
            ))}
          </div>
        )}
        {a.note && (
          <div className="field">
            <label htmlFor="ask-note">{a.note.label}</label>
            <textarea id="ask-note" className="textarea" value={note} placeholder={a.note.placeholder} onChange={(e) => setNote(e.target.value)} />
          </div>
        )}
        {a.typeToConfirm && (
          <div className="field">
            <label htmlFor="ask-type">
              Type <b style={{ color: 'var(--text-headline)' }}>{a.typeToConfirm}</b> to confirm
            </label>
            <input id="ask-type" className="input" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
          </div>
        )}
        <div className="row" style={{ gap: 10, marginTop: 4 }}>
          <Button kind="tonal" full onClick={onClose}>
            Cancel
          </Button>
          <Button kind={btn} full type="submit" disabled={!!blocked}>
            {a.confirm}
          </Button>
        </div>
      </form>
    </div>
  );
}

function EditDialog({ e, onClose }: { e: EditReq; onClose: () => void }) {
  const [v, setV] = useState<Record<string, string>>(() => Object.fromEntries(e.fields.map((f) => [f.key, f.value])));
  const close = useCallback(onClose, [onClose]);
  useEscape(close);
  return (
    <div className="scrim" onClick={onClose}>
      <form
        className="modal"
        style={{ maxWidth: 640 }}
        role="dialog"
        aria-modal="true"
        aria-label={e.title}
        onClick={(ev) => ev.stopPropagation()}
        onSubmit={(ev) => {
          ev.preventDefault();
          e.onSave(v);
          onClose();
        }}
      >
        <h2>{e.title}</h2>
        {e.fields.map((f) => (
          <div className="field" key={f.key}>
            <label htmlFor={`edit-${f.key}`}>{f.label}</label>
            {f.multiline ? (
              <textarea id={`edit-${f.key}`} className="textarea" style={{ minHeight: 140 }} value={v[f.key]} onChange={(ev) => setV({ ...v, [f.key]: ev.target.value })} />
            ) : (
              <input id={`edit-${f.key}`} className="input" value={v[f.key]} onChange={(ev) => setV({ ...v, [f.key]: ev.target.value })} />
            )}
          </div>
        ))}
        <div className="small muted">The author gets a notification that an admin edited the content.</div>
        <div className="row" style={{ gap: 10 }}>
          <Button kind="tonal" full onClick={onClose}>
            Cancel
          </Button>
          <Button kind="primary" full type="submit">
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}
