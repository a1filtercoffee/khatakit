import BreakdownTable from '../../components/calculator/BreakdownTable';
import CalculatorGuide, {
  Formula,
  GuideSection,
  ReferenceLinks,
} from '../../components/calculator/CalculatorGuide';
import RelatedTools from '../../components/calculator/RelatedTools';
import { formatCurrency as rupees } from '../../lib/utils/format';
import { BUSINESS_EXAMPLE as biz, PROFESSION_EXAMPLE as pro } from './example';

export default function PresumptiveGuide() {
  const workings = [
    { item: 'Turnover', amount: rupees(biz.input.grossReceipts) },
    {
      item: `Cash receipts (${biz.cashSharePercent}% of turnover)`,
      amount: rupees(biz.input.cashReceipts),
    },
    { item: 'Limit, as cash is 5% or less', amount: rupees(biz.applicableLimit) },
    { item: `8% of cash receipts`, amount: rupees(biz.cashIncome) },
    {
      item: `6% of bank and online receipts (${rupees(biz.digitalReceipts)})`,
      amount: rupees(biz.digitalIncome),
    },
    { item: 'Presumptive income', amount: rupees(biz.presumptiveIncome) },
    { item: 'Tax on income, new regime', amount: rupees(biz.taxOnIncome) },
    { item: 'Health & Education Cess (4%)', amount: rupees(biz.cess) },
  ];

  return (
    <CalculatorGuide title="How presumptive income is worked out">
      <GuideSection title="How is presumptive income calculated?">
        <p>
          A business declares 6% of bank and online receipts plus 8% of other receipts as income. A
          professional declares 50% of gross receipts.
        </p>
        <Formula
          where={
            <>
              Tax is then worked out on that income with the normal slabs, rebate, surcharge and 4%
              cess. The salary standard deduction does not apply to business or professional income.
            </>
          }
        >
          Business: income = 6% × bank and online receipts + 8% × other receipts
          <br />
          Profession: income = 50% × gross receipts
        </Formula>
        <p>
          You can declare a higher income if your actual profit is higher. The calculator shows the
          minimum presumptive income.
        </p>
      </GuideSection>

      <GuideSection title="What are the turnover limits for 44AD and 44ADA?">
        <p>
          A business can use the scheme up to ₹2 crore of turnover, and a professional up to ₹50
          lakh of gross receipts. When cash receipts are 5% or less, the limits are ₹3 crore and ₹75
          lakh.
        </p>
        <BreakdownTable
          columns={[
            { key: 'scheme', label: 'Scheme', align: 'left' },
            { key: 'base', label: 'Limit', align: 'right', mono: true },
            { key: 'higher', label: 'Cash 5% or less', align: 'right', mono: true },
          ]}
          rows={[
            { scheme: 'Business (old 44AD)', base: '₹2 crore', higher: '₹3 crore' },
            { scheme: 'Profession (old 44ADA)', base: '₹50 lakh', higher: '₹75 lakh' },
          ]}
          caption="Section 58(2) limits"
        />
        <p>
          Cash share is cash receipts ÷ gross receipts. At exactly 5% the higher limit still
          applies. Above the limit, the presumptive scheme is not available.
        </p>
      </GuideSection>

      <GuideSection title="Worked example">
        <p>
          A business has turnover of {rupees(biz.input.grossReceipts)}, of which{' '}
          {rupees(biz.input.cashReceipts)} came in cash. It uses the new regime and has no other
          income.
        </p>
        <BreakdownTable
          columns={[
            { key: 'item', label: 'Particulars', align: 'left' },
            { key: 'amount', label: 'Amount', align: 'right', mono: true },
          ]}
          rows={workings}
          footer={{ item: 'Total tax', amount: rupees(biz.totalTax) }}
          caption="Worked example, business"
        />
        <p>
          With {rupees(biz.higherCash)} of cash the share would be 6%, the limit would fall to{' '}
          {rupees(biz.higherCashLimit)}, and this business could not use the scheme.
        </p>
        <p>
          A professional with {rupees(pro.input.grossReceipts)} of receipts, all through the bank,
          has presumptive income of {rupees(pro.presumptiveIncome)}. New regime tax is{' '}
          {rupees(pro.taxOnIncome)} plus {rupees(pro.cess)} cess, a total of {rupees(pro.totalTax)}.
        </p>
      </GuideSection>

      <GuideSection id="eligibility" title="Eligibility and edge cases">
        <p>
          Business and professional schemes have different eligibility rules. The profession route
          is restricted to specified professions; choosing “profession” here does not establish that
          your work qualifies. This calculator assumes you are resident and have already checked the
          entity, activity and prior scheme-use restrictions with your accountant. It checks the
          receipts limit and cash share, not complete eligibility.
        </p>
        <ul>
          <li>
            <strong>The 5% cash condition.</strong> The ₹3 crore and ₹75 lakh limits need cash
            receipts of 5% or less of the total. Cash of 5.01% brings the limit back to ₹2 crore or
            ₹50 lakh.
          </li>
          <li>
            <strong>Cheques count as cash</strong> unless they are account payee cheques or drafts
            (section 58(9)).
          </li>
          <li>
            <strong>Late bank receipts.</strong> The 6% rate needs payment by banking or online mode
            during the tax year or before the return due date. Later receipts are taxed at 8%.
          </li>
          <li>
            <strong>Advance tax.</strong> Presumptive filers pay the whole advance tax by 15 March
            2027, not in four instalments (section 408(2)).
          </li>
          <li>
            <strong>Near ₹12 lakh.</strong> New regime income up to ₹12 lakh pays no tax. Just above
            it, marginal relief limits tax to the income above ₹12 lakh.
          </li>
        </ul>
      </GuideSection>

      <GuideSection title="Assumptions">
        <ul>
          <li>You are a resident, and the presumptive income is your only income.</li>
          <li>Old regime tax uses the below-60 slabs. Deductions and TDS are not included.</li>
          <li>Whether your profession is listed in section 62(4) is not checked.</li>
          <li>Goods carriages (section 58(2) Table serial 2) are not supported.</li>
          <li>The five-year lock-in in sections 58(7) and 58(8) is not checked.</li>
          <li>For decisions about your own tax, consult a Chartered Accountant.</li>
        </ul>
      </GuideSection>

      <GuideSection title="Supported period">
        <p>
          Tax year 2026-27, which runs from 1 April 2026 to 31 March 2027. Section 58(2) of the
          Income-tax Act, 2025 replaces sections 44AD and 44ADA of the 1961 Act, with the same rates
          and limits. The Finance Act, 2026 changed only section 58(11)(a)(i).
        </p>
        <p>Earlier years fall under the 1961 Act and are not supported.</p>
      </GuideSection>

      <GuideSection title="References">
        <ReferenceLinks
          items={[
            {
              title: 'Income-tax Act, 2025 (Gazette of India)',
              detail:
                'Section 58(2) rates and limits, 58(9) cheques, 156 rebate, 202(1) new regime rates, 408(2) advance tax.',
              url: 'https://egazette.gov.in/WriteReadData/2025/265620.pdf',
            },
            {
              title: 'Finance Act, 2026 (Gazette of India)',
              detail:
                'First Schedule Part III old regime rates; section 3 surcharge and cess; section 40 change to section 58.',
              url: 'https://egazette.gov.in/WriteReadData/2026/271439.pdf',
            },
          ]}
        />
      </GuideSection>

      <GuideSection title="Related calculators">
        <RelatedTools
          slugs={['advance-tax']}
          reasons={{
            'advance-tax':
              'Quarterly instalments and old and new regime comparison for other income.',
          }}
        />
      </GuideSection>
    </CalculatorGuide>
  );
}
