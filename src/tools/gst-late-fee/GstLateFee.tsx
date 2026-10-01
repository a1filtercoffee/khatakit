import { EmptyState } from '../../components/ui/Surface';
import CalculatorPage from '../../components/layout/CalculatorPage';
import { useState, useMemo, useSyncExternalStore } from 'react';
import { calculateGstPenalty } from './calc';
import { validateGstInput, type GstField, type GstValidation } from './schema';
import type { GstInput } from './types';
import GstForm from './GstForm';
import { WORKED_EXAMPLE } from './example';
import GstResults from './GstResults';
import GstGuide from './GstGuide';
import { toInputDateString } from '../../lib/utils/date';

const defaultInput: GstInput = {
  returnType: 'GSTR-3B',
  dueDate: '',
  filingDate: '',
  taxLiability: 0,
  turnoverSlab: 'upto_1_5cr',
  isNilReturn: false,
  stateTurnover: 0,
};

const MISSING_LABELS: Record<GstField, string> = {
  dueDate: 'the due date',
  filingDate: 'the filing date',
  taxLiability: 'tax paid in cash',
  stateTurnover: 'turnover in this State',
};

function emptyMessage({ errors, missing }: GstValidation): string {
  if (Object.keys(errors).length > 0) {
    return 'Fix the highlighted field to see the late fee and interest.';
  }
  const names = missing.map((field) => MISSING_LABELS[field]).join(' and ');
  return `Enter ${names} to see the late fee and interest.`;
}

// Today's date is read in the browser only. The prerendered HTML and the
// hydration pass use an empty date, then React re-renders with today.
const subscribeToNothing = () => () => {};
const readToday = () => toInputDateString(new Date());
const noDateOnServer = () => '';

export function Component() {
  const [stored, setStored] = useState<GstInput>(defaultInput);
  const [filingDateEdited, setFilingDateEdited] = useState(false);
  const today = useSyncExternalStore(subscribeToNothing, readToday, noDateOnServer);
  const input = useMemo(
    () => (filingDateEdited ? stored : { ...stored, filingDate: today }),
    [stored, filingDateEdited, today]
  );

  function setInput(next: GstInput) {
    if (next.filingDate !== input.filingDate) setFilingDateEdited(true);
    setStored(next);
  }

  const validation = useMemo(() => validateGstInput(input), [input]);
  const result = useMemo(
    () => (validation.input ? calculateGstPenalty(validation.input) : null),
    [validation]
  );

  return (
    <CalculatorPage
      slug="gst-late-fee"
      formTitle="Return details"
      form={
        <>
          <GstForm input={input} errors={validation.errors} onChange={setInput} />
          <button
            className="button button-secondary"
            type="button"
            onClick={() => setInput({ ...WORKED_EXAMPLE.input })}
          >
            Load sample return
          </button>
          <p className="field-help">
            Sample: GSTR-3B filed 30 days late, with ₹1 lakh paid in cash.
          </p>
        </>
      }
      hasResult={result !== null && validation.input !== null}
      caveat="Check the amount on the GST portal before paying."
      guide={<GstGuide />}
    >
      {result && validation.input ? (
        <GstResults input={validation.input} result={result} />
      ) : (
        <EmptyState>{emptyMessage(validation)}</EmptyState>
      )}
    </CalculatorPage>
  );
}
