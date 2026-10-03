import type { GstInput, GstReturnType } from './types';
import type { GstValidation } from './schema';
import MonthlyDueDate from './MonthlyDueDate';
import NumberInput from '../../components/ui/NumberInput';
import DateInput from '../../components/ui/DateInput';
import Select from '../../components/ui/Select';
import RadioGroup from '../../components/ui/RadioGroup';
import {
  ANNUAL_TURNOVER_SLABS,
  GST_RETURN_TYPES,
  PERIODIC_TURNOVER_SLABS,
} from '../../lib/constants/gst-rates';

interface GstFormProps {
  input: GstInput;
  errors: GstValidation['errors'];
  onChange: (input: GstInput) => void;
}

const DUE_DATE_HELP: Record<GstReturnType, string> = {
  'GSTR-3B':
    'Monthly GSTR-3B is due on the 20th of the next month. Quarterly GSTR-3B is due on the 22nd or 24th after the quarter, depending on the State. Use the extended date if the due date was extended.',
  'GSTR-1':
    'Monthly GSTR-1 is due on the 11th of the next month. Quarterly GSTR-1 is due on the 13th after the quarter. Use the extended date if the due date was extended.',
  'GSTR-9':
    'GSTR-9 is due on 31 December after the financial year. Use the extended date if the due date was extended.',
};

export default function GstForm({ input, errors, onChange }: GstFormProps) {
  const isAnnual = input.returnType === 'GSTR-9';
  const slabs = isAnnual ? ANNUAL_TURNOVER_SLABS : PERIODIC_TURNOVER_SLABS;

  const changeReturnType = (value: string) => {
    const returnType = value as GstReturnType;
    const nextSlabs = returnType === 'GSTR-9' ? ANNUAL_TURNOVER_SLABS : PERIODIC_TURNOVER_SLABS;
    const keepsSlab = nextSlabs.some((slab) => slab.value === input.turnoverSlab);
    onChange({
      ...input,
      returnType,
      turnoverSlab: keepsSlab ? input.turnoverSlab : nextSlabs[0].value,
      isNilReturn: returnType === 'GSTR-9' ? false : input.isNilReturn,
    });
  };

  return (
    <div className="form-stack calculator-fields">
      <Select
        label="Return type"
        value={input.returnType}
        onChange={changeReturnType}
        options={GST_RETURN_TYPES}
      />

      <DateInput
        label="Due date"
        value={input.dueDate}
        onChange={(v) => onChange({ ...input, dueDate: v })}
        helpText={DUE_DATE_HELP[input.returnType]}
        error={errors.dueDate}
      />

      {!isAnnual && (
        <MonthlyDueDate
          returnType={input.returnType as 'GSTR-1' | 'GSTR-3B'}
          onUse={(date) => onChange({ ...input, dueDate: date })}
        />
      )}

      <DateInput
        label="Actual filing date"
        value={input.filingDate}
        onChange={(v) => onChange({ ...input, filingDate: v })}
        min={input.dueDate}
        helpText="Today's date is filled in. Interest is worked out to this date, taken as the day the tax was paid."
        error={errors.filingDate}
      />

      {!isAnnual && (
        <RadioGroup
          label="Filed as"
          value={input.isNilReturn ? 'nil' : 'non-nil'}
          onChange={(v) => onChange({ ...input, isNilReturn: v === 'nil' })}
          options={[
            { label: 'Regular', value: 'non-nil' },
            { label: 'Nil return', value: 'nil' },
          ]}
          helpText={
            input.returnType === 'GSTR-1'
              ? 'Nil means no outward supplies in the period.'
              : 'Nil means no central tax payable in the return.'
          }
        />
      )}

      {input.returnType === 'GSTR-3B' && !input.isNilReturn && (
        <NumberInput
          label="Tax paid in cash"
          value={input.taxLiability}
          onChange={(v) => onChange({ ...input, taxLiability: v })}
          prefix="₹"
          reportInvalid
          helpText="Tax paid from the electronic cash ledger. Interest applies only to this amount, not to tax paid from input tax credit."
          error={errors.taxLiability}
        />
      )}

      {(isAnnual || !input.isNilReturn) && (
        <Select
          id="aggregate-turnover"
          label={
            isAnnual ? 'Aggregate turnover for the year' : 'Aggregate turnover (previous year)'
          }
          value={input.turnoverSlab}
          onChange={(v) => onChange({ ...input, turnoverSlab: v as GstInput['turnoverSlab'] })}
          options={slabs}
          helpText={
            isAnnual
              ? 'All registrations under the same PAN, for the financial year of the return.'
              : 'All registrations under the same PAN, for the previous financial year.'
          }
        />
      )}

      {isAnnual && (
        <NumberInput
          label="Turnover in this State"
          value={input.stateTurnover ?? 0}
          onChange={(v) => onChange({ ...input, stateTurnover: v })}
          prefix="₹"
          reportInvalid
          helpText="Turnover of this registration's State or Union territory for the year. The late fee cap is a share of it."
          error={errors.stateTurnover}
        />
      )}
    </div>
  );
}
