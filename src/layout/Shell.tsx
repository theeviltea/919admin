// Desktop sidebar + mobile tab bar around every admin page.
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Icon, type IconName } from '../components/ui';
import { useStore } from '../data/store';
import { LOGO_PATHS, LOGO_VIEWBOX } from '../lib/logo';

type Theme = 'system' | 'light' | 'dark';
function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem('919admin.theme') as Theme) || 'system';
    } catch {
      return 'system';
    }
  });
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = theme;
    try {
      localStorage.setItem('919admin.theme', theme);
    } catch {
      /* storage unavailable */
    }
  }, [theme]);
  return [theme, () => setTheme(theme === 'system' ? 'dark' : theme === 'dark' ? 'light' : 'system')] as const;
}

export function LogoMark({ size = 44 }: { size?: number }) {
  return (
    <span className="brand-mark" style={{ width: size, height: size, borderRadius: size * 0.32 }}>
      <svg viewBox={LOGO_VIEWBOX} role="img" aria-label="919" style={{ width: size * 0.62 }}>
        {LOGO_PATHS.map((d, i) => (
          <path key={i} d={d} fill="#FFFFFF" />
        ))}
      </svg>
    </span>
  );
}

type NavItem = { to: string; label: string; icon: IconName; count?: 'employers' | 'vacancies' | 'reports'; group?: string; end?: boolean };
const NAV: NavItem[] = [
  { to: '/', label: 'Overview', icon: 'grid', end: true },
  { to: '/checks/employers', label: 'Employer checks', icon: 'building', count: 'employers', group: 'Moderation' },
  { to: '/checks/vacancies', label: 'Vacancy checks', icon: 'briefcase', count: 'vacancies' },
  { to: '/seekers', label: 'Job seekers', icon: 'users', group: 'Directory' },
  { to: '/companies', label: 'Companies', icon: 'building' },
  { to: '/vacancies', label: 'Vacancies', icon: 'briefcase' },
  { to: '/reports', label: 'Reports', icon: 'alert-circle', count: 'reports', group: 'Safety' },
];

const TABS: { to: string; label: string; icon: IconName; match: string[]; count?: ('employers' | 'vacancies' | 'reports')[] }[] = [
  { to: '/', label: 'Overview', icon: 'grid', match: [] },
  { to: '/checks/employers', label: 'Checks', icon: 'check-double', match: ['/checks'], count: ['employers', 'vacancies'] },
  { to: '/seekers', label: 'Users', icon: 'users', match: ['/seekers', '/companies', '/recruiters'] },
  { to: '/vacancies', label: 'Vacancies', icon: 'briefcase', match: ['/vacancies'] },
  { to: '/reports', label: 'Reports', icon: 'alert-circle', match: ['/reports'], count: ['reports'] },
];

export default function Shell() {
  const { counts } = useStore();
  const [theme, cycle] = useTheme();
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  const themeLabel = theme === 'system' ? 'Theme: system' : theme === 'dark' ? 'Theme: dark' : 'Theme: light';
  return (
    <div className="shell">
      <aside className="sidebar">
        <Link to="/" className="brand">
          <LogoMark />
          <div>
            <div className="brand-name">919 Admin</div>
            <div className="brand-sub">Moderation and data</div>
          </div>
        </Link>
        {NAV.map((n) => (
          <div key={n.to} style={{ display: 'contents' }}>
            {n.group && <div className="nav-group">{n.group}</div>}
            <NavLink to={n.to} end={n.end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon name={n.icon} />
              {n.label}
              {n.count && counts[n.count] > 0 && <span className={`count ${n.count === 'reports' ? 'red' : ''}`}>{counts[n.count]}</span>}
            </NavLink>
          </div>
        ))}
        <div className="me">
          <span className="me-ava">AK</span>
          <div className="grow">
            <div style={{ fontSize: 14, fontWeight: 700 }}>Aibek K.</div>
            <div className="small muted">Admin</div>
          </div>
          <button type="button" className="icon-btn sm" onClick={cycle} aria-label={themeLabel} title={themeLabel} style={{ background: 'var(--surface)' }}>
            <Icon name="moon" size={18} />
          </button>
          <button type="button" className="icon-btn sm" aria-label="Log out" title="Log out" style={{ background: 'var(--surface)' }}>
            <Icon name="logout" size={18} />
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet context={{ cycleTheme: cycle, themeLabel }} />
      </main>
      <nav className="tabbar" aria-label="Admin">
        {TABS.map((t) => {
          const active = t.match.length ? t.match.some((m) => pathname.startsWith(m)) : pathname === '/';
          const n = (t.count ?? []).reduce((a, k) => a + counts[k], 0);
          return (
            <Link key={t.to} to={t.to} className={`tab ${active ? 'active' : ''}`} aria-current={active ? 'page' : undefined}>
              <span className="tab-pill">
                <Icon name={t.icon} size={22} />
                {n > 0 && <span className="count">{n}</span>}
              </span>
              <span className="tab-label">{t.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
