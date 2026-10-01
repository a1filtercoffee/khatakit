import { useMemo, useState } from 'react';
import CalculatorPage from '../../components/layout/CalculatorPage';
import { TAX_YEAR_LABEL } from '../../lib/constants/tax-slabs';
import { calculatePresumptive } from './calc';
import PresumptiveForm from './PresumptiveForm';
import PresumptiveGuide from './PresumptiveGuide';
import PresumptiveResults from './PresumptiveResults';
import { validatePresumptive } from './schema';
import type { PresumptiveInput } from './types';

const defaultInput: PresumptiveInput = {
  scheme: '44ADA',
  grossReceipts: 0,
  cashReceipts: 0,
  regime: 'new',
};

export function Component() {
  const [form, setForm] = useState<PresumptiveInput>(defaultInput);
  const { input, errors } = useMemo(() => validatePresumptive(form), [form]);
  const result = useMemo(() => (input ? calculatePresumptive(input) : null), [input]);

  return (
    <CalculatorPage
      slug="presumptive-tax"
      period={TAX_YEAR_LABEL}
      formTitle={form.scheme === '44ADA' ? 'Professional details' : 'Business details'}
      form={<PresumptiveForm input={form} errors={errors} onChange={setForm} />}
      hasResult={result !== null && result.isWithinLimit && Object.keys(errors).length === 0}
      caveat="An estimate under section 58(2) for tax year 2026-27."
      guide={<PresumptiveGuide />}
    >
      <PresumptiveResults result={result} regime={form.regime} errors={errors} />
    </CalculatorPage>
  );
}
