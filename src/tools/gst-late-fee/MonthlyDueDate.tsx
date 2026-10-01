import { useState } from 'react';
import { formatLongDate } from '../../lib/utils/date';

import { monthlyDueDate } from './due-date';

export default function MonthlyDueDate({
  returnType,
  onUse,
}: {
  returnType: 'GSTR-1' | 'GSTR-3B';
  onUse: (date: string) => void;
}) {
  const [period, setPeriod] = useState('');
  const date = monthlyDueDate(period, returnType);
  return (
    <details className="guide-section">
      <summary>Help me find a monthly return’s due date</summary>
      <div className="form-stack">
        <p className="field-help">
          For monthly {returnType} only. Quarterly returns and IFF have different deadlines. This
          helper uses the standard deadline and does not check extensions.
        </p>
        <div className="field">
          <label className="field-label" htmlFor="monthly-return-period">
            Return month
          </label>
          <input
            id="monthly-return-period"
            className="control"
            type="month"
            min="2021-06"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
          />
        </div>
        {date && (
          <>
            <p>
              Standard due date: <strong>{formatLongDate(date)}</strong>
            </p>
            <button className="button button-secondary" type="button" onClick={() => onUse(date)}>
              Use this due date
            </button>
          </>
        )}
        <p className="field-help">
          Check your return tile on the GST portal for an extended date. You can edit the due date
          above.
        </p>
        <a
          href={
            returnType === 'GSTR-1'
              ? 'https://tutorial.gst.gov.in/userguide/returns/GSTR_1.htm'
              : 'https://tutorial.gst.gov.in/userguide/returns/GSTR3B_-_File_Nil_Return.htm'
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          GST portal guidance
        </a>
      </div>
    </details>
  );
}
