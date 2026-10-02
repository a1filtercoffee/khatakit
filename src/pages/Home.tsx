import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ToolIcon from '../components/ui/ToolIcon';
import { matchesTool, toolCategories, tools } from '../data/tools';

export default function Home() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const searchRef = useRef<HTMLInputElement>(null);
  const matching = tools.filter((tool) => matchesTool(tool, query));
  const visible = matching.filter((tool) => category === 'all' || tool.category === category);
  const filtered = query.trim() !== '' || category !== 'all';

  function reset() {
    setQuery('');
    setCategory('all');
    searchRef.current?.focus();
  }

  return (
    <>
      <div className="workbench">
        <div className="workbench-main">
          <section className="workbench-intro" aria-labelledby="catalogue-title">
            <div className="hero-copy">
              <p className="workbench-kicker">KHATAKIT</p>
              <h1 id="catalogue-title">
                Accounting &
                <br />
                <span>tax tools</span>
              </h1>
              <p className="workbench-subtitle">Tools for GST filing costs, TDS and income tax.</p>
              <p className="workbench-description">
                Each tool includes a calculation breakdown.
                <br />
                Calculations run in your browser.
              </p>
              <nav className="home-quick-tools" aria-label="Choose a calculator">
                {tools.map((tool) => <Link key={tool.slug} to={tool.path}>{tool.name}<span aria-hidden="true"> →</span></Link>)}
              </nav>
            </div>
            <div
              className="hero-art"
              aria-label="Illustrative TDS interest calculation for a late deposit"
            >
              <div className="ledger-sheet">
                <div className="ledger-heading">
                  <ToolIcon name="receipt" />
                  <span>TDS WORKSHEET</span>
                  <span className="ledger-dots" aria-hidden="true">
                    •••
                  </span>
                </div>
                <div className="ledger-subheading">
                  Late deposit <span>Example</span>
                </div>
                <dl>
                  <div>
                    <dt>TDS amount</dt>
                    <dd>₹10,000</dd>
                  </div>
                  <div>
                    <dt>Monthly interest</dt>
                    <dd>1.5%</dd>
                  </div>
                  <div>
                    <dt>Months counted</dt>
                    <dd>2</dd>
                  </div>
                </dl>
                <div className="ledger-total">
                  <span>Interest on late deposit</span>
                  <strong>
                    ₹300
                  </strong>
                </div>
                <p>₹10,000 × 1.5% × 2 months</p>
              </div>
              <span className="art-sticker">
                <span aria-hidden="true">✓</span> 10 May – 20 June 2026
              </span>
              <svg className="art-scribble" viewBox="0 0 100 80" fill="none" aria-hidden="true">
                <path
                  d="M8 14c60-20 80 20 43 24C16 40 50 4 80 60m-18-6 19 9 3-22"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </section>
          <section id="tools" className="tool-directory" aria-labelledby="directory-title">
            <div className="directory-intro">
              <p>TOOL CATALOGUE</p>
              <h2>Available calculators</h2>
            </div>
            <div className="tool-search">
              <ToolIcon name="search" />
              <label className="sr-only" htmlFor="tool-search">
                Search tools
              </label>
              <input
                ref={searchRef}
                id="tool-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setQuery('');
                  }
                }}
                placeholder="Find a tool: GST late fees, TDS…"
                autoComplete="off"
                spellCheck={false}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    searchRef.current?.focus();
                  }}
                  aria-label="Clear search"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="category-nav" role="group" aria-label="Filter tools by category">
              {[{ id: 'all', label: 'All tools', icon: 'grid' }, ...toolCategories].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={category === item.id}
                  onClick={() => setCategory(item.id)}
                >
                  <ToolIcon name={item.icon} />
                  <span>{item.label}</span>
                  <small>
                    {item.id === 'all'
                      ? tools.length
                      : tools.filter((tool) => tool.category === item.id).length}
                  </small>
                </button>
              ))}
            </div>
            <div className="directory-toolbar">
              <h2 id="directory-title">
                {query
                  ? 'Search results'
                  : category === 'all'
                    ? 'All tools'
                    : toolCategories.find((item) => item.id === category)?.label}
                <span role="status">
                  {visible.length} {visible.length === 1 ? 'tool' : 'tools'}
                  {filtered ? ' found' : ' available'}
                </span>
              </h2>
              {filtered && (
                <button type="button" onClick={reset}>
                  <ToolIcon name="reset" /> Reset filters
                </button>
              )}
            </div>
            {visible.length === 0 ? (
              <div className="tools-empty">
                <ToolIcon name="search" />
                <h3>No tools match this search</h3>
                <p>
                  Try GST late fees, TDS or 44ADA. You can also reset the category to see every
                  tool.
                </p>
                <button type="button" onClick={reset}>
                  Show all tools <ToolIcon name="arrow" />
                </button>
              </div>
            ) : (
              <div className="tool-grid">
                {visible.map((tool) => (
                  <Link
                    className={`tool-tile tile-${tool.category}`}
                    to={tool.path}
                    key={tool.slug}
                  >
                    <div className="tile-top">
                      <span className="tile-icon">
                        <ToolIcon name={tool.icon} />
                      </span>
                      <span className="tile-category">
                        {toolCategories.find((item) => item.id === tool.category)?.label}
                      </span>
                    </div>
                    <h3>{tool.name.replace(' Calculator', '')}</h3>
                    <p>{tool.summary}</p>
                    <div className="tile-bottom">
                      <span>{tool.output}</span>
                      <span className="tile-open">
                        Open tool
                        <ToolIcon name="arrow" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
          <section className="workbench-about common-tasks" aria-labelledby="common-tasks-title">
            <div>
              <h2 id="common-tasks-title">Common GST and TDS questions</h2>
              <p>Read the rules, examples and assumptions before calculating.</p>
              <ul>
                <li>
                  <Link to="/gst-late-fee-interest-calculator#late-fee-rates">
                    How GST late fees and interest are calculated
                  </Link>
                </li>
                <li>
                  <Link to="/gst-late-fee-interest-calculator#edge-cases">
                    GST nil returns and late fee caps
                  </Link>
                </li>
                <li>
                  <Link to="/tds-interest-calculator#deposit-due-dates">
                    TDS deposit due dates, including March
                  </Link>
                </li>
                <li>
                  <Link to="/tds-interest-calculator#counting-months">
                    Counting months for TDS interest
                  </Link>
                </li>
              </ul>
            </div>
          </section>
          <section className="workbench-about" aria-labelledby="about-title">
            <div>
              <h2 id="about-title">About Khatakit</h2>
              <p>
                Khatakit is a collection of free accounting and financial tools.
                <br className="desktop-break" /> Suggestions, corrections and contributions are
                welcome.
              </p>
            </div>
            <Link to="/about">
              Who builds it and how rules are checked <ToolIcon name="arrow" />
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
