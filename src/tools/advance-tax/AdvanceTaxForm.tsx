import NumberInput from '../../components/ui/NumberInput';
import RadioGroup from '../../components/ui/RadioGroup';
import Select from '../../components/ui/Select';
import type { AdvanceTaxField, AdvanceTaxForm as FormValues } from './schema';
import type { AgeCategory, TaxRegime } from './types';

interface AdvanceTaxFormProps {
  form: FormValues;
  errors: Partial<Record<AdvanceTaxField, string>>;
  onChange: (form: FormValues) => void;
}

export default function AdvanceTaxForm({ form, errors, onChange }: AdvanceTaxFormProps) {
  return (
    <div className="form-stack">
      <p className="field-help">
        For regular quarterly instalments and ordinary-rate income.{' '}
        <a href="/presumptive-income-calculator">Presumptive filers use a different schedule.</a>{' '}
        Capital gains and other special-rate income need a separate computation.
      </p>
      <RadioGroup
        label="Tax regime"
        value={form.regime}
        onChange={(v) => onChange({ ...form, regime: v as TaxRegime })}
        options={[
          { label: 'New regime', value: 'new' },
          { label: 'Old regime', value: 'old' },
        ]}
        helpText="Both regimes are worked out. The schedule follows the one you pick."
      />

      <NumberInput
        id="gross-income"
        label="Gross total income"
        value={form.grossIncome}
        onChange={(v) => onChange({ ...form, grossIncome: v })}
        prefix="₹"
        reportInvalid
        error={errors.grossIncome}
        helpText="Expected income for 1 April 2026 to 31 March 2027, before deductions"
      />

      <NumberInput
        id="salary-income"
        label="Salary or pension included"
        value={form.salaryIncome}
        onChange={(v) => onChange({ ...form, salaryIncome: v })}
        prefix="₹"
        reportInvalid
        error={errors.salaryIncome}
        helpText="Part of the income above. Standard deduction comes only from this: up to ₹75,000 (new) or ₹50,000 (old)"
      />

      {form.regime === 'old' && (
        <NumberInput
          id="deductions"
          label="Total deductions (80C, 80D, etc.)"
          value={form.deductions}
          onChange={(v) => onChange({ ...form, deductions: v })}
          prefix="₹"
          reportInvalid
          error={errors.deductions}
          helpText="Chapter VI-A deductions. The new regime does not allow them."
        />
      )}

      <NumberInput
        id="tds-deducted"
        label="Expected annual TDS / TCS"
        value={form.tdsDeducted}
        onChange={(v) => onChange({ ...form, tdsDeducted: v })}
        prefix="₹"
        reportInvalid
        error={errors.tdsDeducted}
        helpText="Eligible Indian tax credits expected for this income year, including amounts already deducted. Enter advance-tax payments separately in the payment planner."
      />

      <Select
        id="age-category"
        label="Age category"
        value={form.ageCategory}
        onChange={(v) => onChange({ ...form, ageCategory: v as AgeCategory })}
        options={[
          { value: 'below60', label: 'Below 60 years' },
          { value: '60to80', label: '60 to 79 years' },
          { value: 'above80', label: '80 years or more' },
        ]}
        helpText="Age at any time during the tax year"
      />

      {form.ageCategory !== 'below60' && (
        <RadioGroup
          label="Business or professional income"
          value={form.hasBusinessIncome ? 'yes' : 'no'}
          onChange={(v) => onChange({ ...form, hasBusinessIncome: v === 'yes' })}
          options={[
            { label: 'No', value: 'no' },
            { label: 'Yes', value: 'yes' },
          ]}
          helpText="Resident seniors without business or professional income do not pay advance tax"
        />
      )}
    </div>
  );
}
