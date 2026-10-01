import { Link } from 'react-router-dom';
import { tools } from '../../data/tools';
import ToolIcon from '../ui/ToolIcon';

interface RelatedToolsProps {
  /** Tool slugs in display order. Slugs not in the catalogue are skipped. */
  slugs: string[];
  /** Why each tool is relevant, keyed by slug. Falls back to the catalogue description. */
  reasons?: Record<string, string>;
}

export default function RelatedTools({ slugs, reasons = {} }: RelatedToolsProps) {
  const related = slugs
    .map((slug) => tools.find((tool) => tool.slug === slug))
    .filter((tool) => tool !== undefined);

  return (
    <ul className="related-tools">
      {related.map((tool) => (
        <li key={tool.slug}>
          <Link to={tool.path}>
            <ToolIcon name={tool.icon} />
            <span>
              <strong>{tool.name}</strong>
              <small>{reasons[tool.slug] ?? tool.description}</small>
            </span>
          </Link>
        </li>
      ))}
      <li>
        <Link to="/#tools">
          <ToolIcon name="grid" />
          <span>
            <strong>All calculators</strong>
            <small>GST filing costs, TDS and income tax.</small>
          </span>
        </Link>
      </li>
    </ul>
  );
}
