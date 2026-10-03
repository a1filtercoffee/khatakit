import { useEffect, useId, useRef, useState } from 'react';

interface Column {
  key: string;
  label: string;
  align?: 'left' | 'right';
  mono?: boolean;
}

interface BreakdownTableProps {
  columns: Column[];
  rows: Record<string, string | number>[];
  footer?: Record<string, string | number>;
  caption?: string;
}

export default function BreakdownTable({ columns, rows, footer, caption }: BreakdownTableProps) {
  const region = useRef<HTMLDivElement>(null);
  const hintId = useId();
  const [overflows, setOverflows] = useState(false);
  useEffect(() => {
    const element = region.current;
    if (!element) return;
    const measure = () => setOverflows(element.scrollWidth > element.clientWidth + 1);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    if (element.firstElementChild) observer.observe(element.firstElementChild);
    return () => observer.disconnect();
  }, [columns, rows]);
  return (
    <div className="breakdown-table-group">
      {overflows && (
        <p id={hintId} className="table-scroll-hint">
          Scroll sideways to see all columns →
        </p>
      )}
      <div
        ref={region}
        aria-describedby={overflows ? hintId : undefined}
        className="breakdown-scroll"
        role="region"
        aria-label={caption || 'Calculation breakdown'}
        tabIndex={0}
      >
        <table className="breakdown-table">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={col.align === 'right' ? 'cell-right' : 'cell-left'}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`${col.align === 'right' ? 'cell-right' : 'cell-left'} ${col.mono ? 'cell-number' : ''}`}
                  >
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {footer && (
            <tfoot>
              <tr>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`${col.align === 'right' ? 'cell-right' : 'cell-left'} ${col.mono ? 'cell-number' : ''}`}
                  >
                    {footer[col.key] ?? ''}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
