import type { ReactNode } from 'react';
import DateInput from '../../components/ui/DateInput';
import NumberInput from '../../components/ui/NumberInput';
import RadioGroup from '../../components/ui/RadioGroup';
import Select from '../../components/ui/Select';
import { DEDUCTOR_TYPES } from './rules';
import type { SingleInput } from './single';
import type { DeductorType } from './types';

export type Mode = 'single' | 'bulk';

interface Props {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  deductorType: DeductorType;
  onDeductorTypeChange: (type: DeductorType) => void;
  asOf: string;
  onAsOfChange: (date: string) => void;
  today: string;
  single: SingleInput;
  onSingleChange: (input: SingleInput) => void;
  /** Import controls shown in bulk mode. */
  bulkImport: ReactNode;
}

export default function TdsForm(props: Props) {
  const { mode, single, onSingleChange, today } = props;
  const max = today || undefined;
  return (
    <div className={mode === 'bulk' ? 'form-stack form-columns' : 'form-stack'}>
      <RadioGroup
        label="Calculate for"
        value={mode}
        onChange={(value) => props.onModeChange(value as Mode)}
        options={[
          { label: 'One case', value: 'single' },
          { label: 'Many rows', value: 'bulk' },
        ]}
      />
      <Select
        id="deductor-type"
        label="Deductor"
        value={props.deductorType}
        onChange={(value) => props.onDeductorTypeChange(value as DeductorType)}
        options={DEDUCTOR_TYPES}
        helpText="Sets the due date. A government office paying without a challan must deposit on the day of deduction."
      />

      {mode === 'single' && (
        <>
          <NumberInput
            id="tds-amount"
            label="TDS amount"
            prefix="₹"
            min={0}
            value={single.amount}
            onChange={(amount) => onSingleChange({ ...single, amount })}
            helpText="Interest is worked out on this amount rounded down to a multiple of ₹100."
          />
          <DateInput
            id="date-deductible"
            label="Date tax was deductible"
            value={single.deductible}
            max={max}
            onChange={(deductible) => onSingleChange({ ...single, deductible })}
            helpText="Date of credit or payment, whichever was earlier. Leave blank if tax was deducted on time."
          />
          <DateInput
            id="date-deducted"
            label="Date tax was deducted"
            value={single.deducted}
            max={max}
            onChange={(deducted) => onSingleChange({ ...single, deducted })}
            helpText="Leave blank if not deducted yet."
          />
          <DateInput
            id="date-deposited"
            label="Date tax was deposited"
            value={single.deposited}
            min={single.deducted || undefined}
            max={max}
            onChange={(deposited) => onSingleChange({ ...single, deposited })}
            helpText="Leave blank if not deposited yet."
          />
        </>
      )}

      <DateInput
        id="as-of-date"
        label="Work out interest up to"
        value={props.asOf}
        max={max}
        onChange={props.onAsOfChange}
        helpText="Used when the date deducted or deposited is blank. Starts as today."
      />

      {mode === 'single' && (
        <>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => {
              props.onDeductorTypeChange('non-government');
              props.onAsOfChange('2026-06-20');
              onSingleChange({
                amount: 10000,
                deductible: '2026-05-10',
                deducted: '2026-05-10',
                deposited: '2026-06-20',
              });
            }}
          >
            Load sample case
          </button>
          <p className="field-help">
            Sample: ₹10,000 deducted on 10 May and deposited on 20 June 2026.
          </p>
        </>
      )}
      {mode === 'bulk' && props.bulkImport}
    </div>
  );
}
