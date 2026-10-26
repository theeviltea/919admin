// Router links. In the single-file preview the artifact viewer intercepts every <a href> click,
// so there links render without href and navigate in memory; the real build uses plain router links.
import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { Link as RLink, NavLink as RNavLink, useMatch, useNavigate, useResolvedPath } from 'react-router-dom';

export const PREVIEW = import.meta.env.MODE === 'preview';

type Props = {
  to: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  'aria-label'?: string;
  'aria-current'?: 'page' | undefined;
  title?: string;
};

function useGo(to: string) {
  const nav = useNavigate();
  return {
    onClick: (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      nav(to);
    },
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        nav(to);
      }
    },
  };
}

function PreviewLink({ to, children, ...rest }: Props) {
  const go = useGo(to);
  return (
    <span role="link" tabIndex={0} data-to={to} {...go} {...rest}>
      {children}
    </span>
  );
}

export function Link(p: Props) {
  if (PREVIEW) return <PreviewLink {...p} />;
  const { to, children, ...rest } = p;
  return (
    <RLink to={to} {...rest}>
      {children}
    </RLink>
  );
}

export function NavLink({ to, end, className, children }: { to: string; end?: boolean; className: (a: { isActive: boolean }) => string; children: ReactNode }) {
  const path = useResolvedPath(to);
  const isActive = !!useMatch({ path: path.pathname, end: !!end });
  if (PREVIEW)
    return (
      <PreviewLink to={to} className={className({ isActive })} aria-current={isActive ? 'page' : undefined}>
        {children}
      </PreviewLink>
    );
  return (
    <RNavLink to={to} end={end} className={className}>
      {children}
    </RNavLink>
  );
}
