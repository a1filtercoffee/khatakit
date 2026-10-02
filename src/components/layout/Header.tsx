import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { tools } from '../../data/tools';
import Logo from '../brand/Logo';
export default function Header() {
  const { pathname } = useLocation();
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => { if (menu.current) menu.current.open = false; }, [pathname]);
  useEffect(() => {
    function close(event: MouseEvent) {
      if (menu.current && !menu.current.contains(event.target as Node)) menu.current.open = false;
    }
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape' && menu.current?.open) {
        menu.current.open = false;
        menu.current.querySelector('summary')?.focus();
      }
    }
    document.addEventListener('click', close);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('click', close); document.removeEventListener('keydown', escape); };
  }, []);
  return <header className="site-header"><div className="site-header-inner">
    <Link to="/" className="site-brand" aria-label="Khatakit home"><Logo /></Link>
    <nav aria-label="Main navigation">
      <details className="tool-switcher" ref={menu}>
        <summary>Tools <span aria-hidden="true">⌄</span></summary>
        <div className="tool-switcher-links">
          {tools.map((tool) => <Link key={tool.slug} to={tool.path} aria-current={pathname === tool.path ? 'page' : undefined}>{tool.name}</Link>)}
          <Link to="/">All tools</Link>
        </div>
      </details>
      <Link to="/about" aria-current={pathname === '/about' ? 'page' : undefined}>About</Link>
    </nav>
    <span className="header-note"><span aria-hidden="true" />Free · No account required</span>
  </div></header>;
}
