import { useTabDraft } from '../../lib/drafts/use-tab-draft';
import { advanceDraft } from '../../lib/drafts/schemas';
import { useMemo } from 'react';
import CalculatorPage from '../../components/layout/CalculatorPage';
import { TAX_YEAR_LABEL } from '../../lib/constants/tax-slabs';
import AdvanceTaxForm from './AdvanceTaxForm';
import AdvanceTaxGuide from './AdvanceTaxGuide';
import AdvanceTaxResults from './AdvanceTaxResults';
import { calculateAdvanceTax } from './calc';
import { validateAdvanceTax, type AdvanceTaxForm as FormValues } from './schema';

const defaultForm: FormValues = {
  regime: 'new',
  grossIncome: 0,
  salaryIncome: 0,
  deductions: 0,
  tdsDeducted: 0,
  ageCategory: 'below60',
  hasBusinessIncome: false,
};

export function Component() {
  const [form, setForm] = useTabDraft<FormValues>('advance-tax', defaultForm, advanceDraft);
  const { input, errors } = useMemo(() => validateAdvanceTax(form), [form]);
  const result = useMemo(() => (input ? calculateAdvanceTax(input) : null), [input]);

  return (
    <CalculatorPage
      slug="advance-tax"
      period={TAX_YEAR_LABEL}
      formTitle="Income details"
      form={<AdvanceTaxForm form={form} errors={errors} onChange={setForm} />}
      hasResult={result !== null && Object.keys(errors).length === 0}
      caveat="An estimate for resident individuals in tax year 2026-27."
      guide={<AdvanceTaxGuide />}
    >
      <AdvanceTaxResults input={input} result={result} errors={errors} />
    </CalculatorPage>
  );
}
