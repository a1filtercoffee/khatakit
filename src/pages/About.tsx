import { Link } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import { Panel } from '../components/ui/Surface';
import Disclaimer from '../components/ui/Disclaimer';
import ToolIcon from '../components/ui/ToolIcon';
import { latestRulesReview, tools } from '../data/tools';
import { formatLongDate } from '../lib/utils/date';
import { ISSUES_URL, PUBLISHER, REPO_URL, RULES_REVIEW_URL } from '../seo/site';

const reviewed = formatLongDate(latestRulesReview);

export default function About() {
  return (
    <>
      <PageShell
        title="About Khatakit"
        description="A collection of free accounting, tax and financial calculators for India."
        eyebrow="The project"
        icon="briefcase"
        reading
      >
        <div className="content-stack">
          <Panel title="What is Khatakit?" icon="grid">
            <div className="prose">
              <p>
                <strong>Khata means ledger. Kit means toolkit.</strong> Khatakit brings together
                free calculators for taxes, loans and everyday accounting in India.
              </p>
              <p>
                Each calculator shows its workings, assumptions and sources. The calculators are
                free to use and do not require an account.
              </p>
            </div>
          </Panel>
          <Panel title="Who builds Khatakit?" icon="info">
            <div className="prose">
              <p>
                Khatakit is built and maintained by Sagar at{' '}
                <a href={PUBLISHER.url} target="_blank" rel="noopener noreferrer">
                  filtercoffee.dev
                </a>
                . Sagar is an independent developer.
              </p>
              <p>
                Khatakit is free and open source under the MIT licence. It has no accounts or
                cookies. Cloudflare Web Analytics measures page visits and site performance.
              </p>
            </div>
          </Panel>
          <Panel title="How the rules are checked" icon="check" id="rules">
            <div className="prose">
              <p>
                Every rate, limit, due date and formula comes from a primary source: the Act, the
                Gazette notification, a CBIC or CBDT circular, or an RBI document. Blog posts and
                other calculators do not count as sources.
              </p>
              <p>
                Each calculator lists its sources under References in its guide. Tests check the
                calculations, and the worked examples in each guide, against the calculator code.
              </p>
              <p>
                The{' '}
                <a href={RULES_REVIEW_URL} target="_blank" rel="noopener noreferrer">
                  rules review record on GitHub
                </a>{' '}
                lists each rule, the source it was checked against and the date of the check. The
                rules were last reviewed on {reviewed}.
              </p>
            </div>
          </Panel>
          <Panel title="Available calculators" icon="calculator">
            <ul className="related-tools">
              {tools.map((tool) => (
                <li key={tool.slug}>
                  <Link to={tool.path}>
                    <ToolIcon name={tool.icon} />
                    <span>
                      <strong>{tool.name}</strong>
                      <small>{tool.summary}</small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Privacy" icon="shield">
            <div className="prose">
              <ul className="principles">
                {[
                  [
                    'Local calculations',
                    'Your financial inputs are processed in your browser, without sending them to a calculation server.',
                  ],
                  [
                    'Analytics without cookies',
                    'Cloudflare Web Analytics measures page visits and site performance without cookies. Financial inputs and calculation results are not sent to analytics.',
                  ],
                  [
                    'No saved financial inputs',
                    'Working values stay in page memory. Reloading the page clears them; copying results is your choice.',
                  ],
                  [
                    'Website requests',
                    'The website serves its application scripts and icons from the static host and loads an analytics script from Cloudflare. Your browser sends page and performance metrics to Cloudflare.',
                  ],
                ].map(([title, body]) => (
                  <li key={title}>
                    <ToolIcon name="check" />
                    <span>
                      <strong>{title}.</strong> {body}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>
          <Panel title="Report an error" icon="info">
            <div className="prose">
              <p>
                If a figure looks wrong, open an issue on GitHub. Include the calculator name, the
                period and a made-up example. Keep personal financial records out of public issues.
              </p>
              <p>The source code is public. Corrections, suggestions and pull requests are welcome.</p>
            </div>
            <div className="page-actions">
              <a
                className="button button-primary"
                href={ISSUES_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Report an error <ToolIcon name="arrow" />
              </a>
              <a
                className="button button-secondary"
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Source code on GitHub
              </a>
            </div>
          </Panel>
          <Disclaimer title="Not tax advice">
            Khatakit is not tax advice, legal advice or financial advice. The calculators give
            estimates based on the rules as read on {reviewed}. Check the figures with a chartered
            accountant or the official portal before you file or pay.
          </Disclaimer>
        </div>
      </PageShell>
    </>
  );
}
