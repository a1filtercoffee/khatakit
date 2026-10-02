import { useTabDraft } from '../../lib/drafts/use-tab-draft';
import { tdsSingleDraft, tdsRowsDraft, tdsModeDraft, deductorDraft, enteredDateDraft } from '../../lib/drafts/schemas';
import { useMemo, useRef, useState, useSyncExternalStore } from 'react';
import CalculatorPage from '../../components/layout/CalculatorPage';
import { EmptyState, Notice } from '../../components/ui/Surface';
import { toInputDateString } from '../../lib/utils/date';
import BulkEditor from './BulkEditor';
import BulkImport from './BulkImport';
import BulkResults from './BulkResults';
import { parseDelimited } from './csv';
import { plural } from './format';
import { pasteIntoDrafts, tableToDrafts } from './import';
import { calculateDrafts, draftOutcome, emptyDraft, isBlankDraft, MAX_ROWS } from './sheet';
import { EMPTY_SINGLE, isSingleReady, singleToDraft, type SingleInput } from './single';
import SingleResult from './SingleResult';
import TdsForm, { type Mode } from './TdsForm';
import TdsGuide from './TdsGuide';
import type { DeductorType, DraftField, DraftRow, SheetOptions } from './types';

// Today is read in the browser only. Prerendered HTML and hydration use '', then React
// re-renders with today's date.
const subscribeToNothing = () => () => {};
const readToday = () => toInputDateString(new Date());
const noDateOnServer = () => '';

const INITIAL_ROWS = [emptyDraft('1')];

type ImportStatus = { tone: 'success' | 'error'; message: string } | null;

export function Component() {
  const today = useSyncExternalStore(subscribeToNothing, readToday, noDateOnServer);
  const [mode, setMode] = useTabDraft<Mode>('tds-interest:mode', 'single', tdsModeDraft);
  const [deductorType, setDeductorType] = useTabDraft<DeductorType>('tds-interest:deductor', 'non-government', deductorDraft);
  const [asOfEntered, setAsOfEntered] = useTabDraft<string | null>('tds-interest:as-of', null, enteredDateDraft);
  const [single, setSingle] = useTabDraft<SingleInput>('tds-interest:single', EMPTY_SINGLE, tdsSingleDraft);
  const [drafts, setDrafts] = useTabDraft<DraftRow[]>('tds-interest:rows', INITIAL_ROWS, tdsRowsDraft);
  const [importStatus, setImportStatus] = useState<ImportStatus>(null);
  const nextId = useRef(2);

  const asOf = asOfEntered ?? today;
  const options = useMemo<SheetOptions>(
    () => ({ asOf, today, deductorType }),
    [asOf, today, deductorType]
  );

  const singleDraft = useMemo(() => singleToDraft(single), [single]);
  const singleOutcome = useMemo(
    () => (today && isSingleReady(single) ? draftOutcome(singleDraft, options) : null),
    [today, single, singleDraft, options]
  );
  const sheet = useMemo(
    () => (today ? calculateDrafts(drafts, options) : null),
    [today, drafts, options]
  );

  const makeId = () => {
    const ids = new Set(drafts.map((row) => row.id));
    while (ids.has(String(nextId.current))) nextId.current++;
    return String(nextId.current++);
  };

  function addRow() {
    setDrafts((current) =>
      current.length >= MAX_ROWS ? current : [...current, emptyDraft(makeId())]
    );
  }

  function removeRow(id: string) {
    const remaining = drafts.filter((draft) => draft.id !== id);
    setDrafts(remaining.length > 0 ? remaining : [emptyDraft(makeId())]);
  }

  function changeCell(id: string, field: DraftField, value: string) {
    setDrafts((current) =>
      current.map((draft) => (draft.id === id ? { ...draft, [field]: value } : draft))
    );
  }

  function pasteCells(rowIndex: number, fieldIndex: number, text: string) {
    setDrafts(pasteIntoDrafts(drafts, rowIndex, fieldIndex, parseDelimited(text, '\t'), makeId));
  }

  function importFile(text: string, name: string) {
    const { drafts: imported, skipped } = tableToDrafts(parseDelimited(text));
    if (imported.length === 0) {
      setImportStatus({
        tone: 'error',
        message: `No rows found in ${name}. Use the columns in the CSV template.`,
      });
      return;
    }
    const kept = drafts.filter((draft) => !isBlankDraft(draft));
    const room = Math.max(0, MAX_ROWS - kept.length);
    const added = imported.slice(0, room).map((row) => ({ id: makeId(), ...row }));
    const dropped = skipped + imported.length - added.length;
    setDrafts([...kept, ...added]);
    setImportStatus({
      tone: 'success',
      message: `Added ${plural(added.length, 'row', 'rows')} from ${name}.${
        dropped > 0
          ? ` ${plural(dropped, 'row was', 'rows were')} skipped (too few columns or over ${MAX_ROWS} rows).`
          : ''
      }`,
    });
  }

  const amountError = !Number.isFinite(single.amount) ? 'Enter a valid TDS amount.' : single.amount < 0 ? 'TDS amount cannot be negative.' : undefined;

  const singleContent =
    amountError ? <Notice title="Check the TDS amount" tone="warning">{amountError}</Notice> : singleOutcome === null ? (
      <EmptyState>
        Enter the TDS amount and the date tax was deducted to see the interest, the due date and
        each month counted.
      </EmptyState>
    ) : singleOutcome.status === 'error' ? (
      <Notice title="Check these entries" tone="warning">
        <ul className="notice-list">
          {singleOutcome.errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      </Notice>
    ) : singleOutcome.status === 'ok' ? (
      <SingleResult result={singleOutcome} draft={singleDraft} options={options} />
    ) : null;

  const hasResult =
    mode === 'single' ? singleOutcome?.status === 'ok' : (sheet?.calculatedCount ?? 0) > 0;

  return (
    <CalculatorPage
      slug="tds-interest"
      period="Dates from 1 April 2021"
      layout={mode === 'single' ? 'split' : 'stacked'}
      formTitle={mode === 'single' ? 'TDS details' : 'Sheet settings'}
      form={
        <TdsForm
          mode={mode}
          onModeChange={setMode}
          deductorType={deductorType}
          onDeductorTypeChange={setDeductorType}
          asOf={asOf}
          onAsOfChange={setAsOfEntered}
          today={today}
          single={single}
          amountError={amountError}
          onSingleChange={setSingle}
          bulkImport={
            <BulkImport
              status={importStatus}
              onFile={importFile}
              onError={(message) => setImportStatus({ tone: 'error', message })}
            />
          }
        />
      }
      hasResult={hasResult}
      caveat="Check any TRACES demand against its own workings before paying."
      guide={<TdsGuide />}
    >
      {mode === 'single' ? (
        singleContent
      ) : (
        <>
          <BulkEditor
            drafts={drafts}
            outcomes={sheet?.outcomes ?? null}
            onChange={changeCell}
            onAdd={addRow}
            onRemove={removeRow}
            onPaste={pasteCells}
          />
          {sheet && <BulkResults sheet={sheet} drafts={drafts} options={options} />}
        </>
      )}
    </CalculatorPage>
  );
}
