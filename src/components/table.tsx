// Desktop table that turns into a card list on phones. Optional row selection with a bulk-action bar.
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Checkbox, Empty, Pager, useIsMobile } from './ui';

export type Column<T> = { label: string; render: (row: T) => ReactNode; width?: number | string; align?: 'right' };

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  href,
  mobile,
  total,
  bulk,
  emptyTitle = 'Nothing found',
  emptyText = 'Try another search or filter.',
}: {
  rows: T[];
  columns: Column<T>[];
  href: (row: T) => string;
  mobile: (row: T) => ReactNode;
  total?: string;
  bulk?: (ids: string[], clear: () => void) => ReactNode;
  emptyTitle?: string;
  emptyText?: string;
}) {
  const nav = useNavigate();
  const isMobile = useIsMobile();
  const [sel, setSel] = useState<string[]>([]);
  const live = sel.filter((id) => rows.some((r) => r.id === id));
  const all = rows.length > 0 && live.length === rows.length;
  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  if (!rows.length)
    return (
      <div className="table">
        <Empty title={emptyTitle} text={emptyText} />
      </div>
    );

  if (isMobile)
    return (
      <div className="mlist">
        {rows.map((r) => (
          <a
            key={r.id}
            href={href(r)}
            className="mcard"
            onClick={(e) => {
              e.preventDefault();
              nav(href(r));
            }}
          >
            {mobile(r)}
          </a>
        ))}
        {total && <div className="small muted" style={{ textAlign: 'center', padding: 8 }}>Showing {rows.length} of {total}</div>}
      </div>
    );

  return (
    <>
      {bulk && live.length > 0 && (
        <div className="bulk">
          <span className="strong">{live.length} selected</span>
          <span className="grow" />
          {bulk(live, () => setSel([]))}
          <button type="button" className="btn XS tonal" onClick={() => setSel([])}>
            Clear
          </button>
        </div>
      )}
      <div className="table">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {bulk && (
                  <th style={{ width: 20 }}>
                    <Checkbox on={all} label="Select all" onChange={() => setSel(all ? [] : rows.map((r) => r.id))} />
                  </th>
                )}
                {columns.map((c) => (
                  <th key={c.label} style={{ width: c.width, textAlign: c.align }}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={live.includes(r.id) ? 'sel' : ''} onClick={() => nav(href(r))}>
                  {bulk && (
                    <td>
                      <Checkbox on={live.includes(r.id)} label="Select row" onChange={() => toggle(r.id)} />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td key={c.label} style={{ textAlign: c.align }}>
                      {c.render(r)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total && <Pager shown={rows.length} total={total} />}
      </div>
    </>
  );
}
