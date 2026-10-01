import { GuideSection } from '../../components/calculator/CalculatorGuide';
import RelatedTools from '../../components/calculator/RelatedTools';
import { gstLateFeeCitations } from '../../lib/legal/citations/gst-late-fee';

export default function GstGuideNotes() {
  return (
    <>
      <GuideSection id="edge-cases" title="Edge cases">
        <ul>
          <li>
            <strong>Nil return.</strong> A nil GSTR-3B (no tax payable) or a nil GSTR-1 (no outward
            supplies) costs ₹20 a day, up to ₹500 in total. A nil GSTR-3B carries no interest.
          </li>
          <li>
            <strong>Caps.</strong> A regular GSTR-3B or GSTR-1 stops at ₹2,000 for aggregate
            turnover up to ₹1.5 crore in the previous year, and ₹5,000 up to ₹5 crore. Above ₹5
            crore, section 47(1) caps it at ₹10,000.
          </li>
          <li>
            <strong>Filing on the due date.</strong> Nothing is payable for a return filed on the
            due date. Counting starts the next day.
          </li>
          <li>
            <strong>GSTR-9 turnover.</strong> The daily fee depends on aggregate turnover for the
            year of the return, across all registrations under the same PAN. The cap is a share of
            turnover in the State of the registration, entered in Turnover in this State.
          </li>
          <li>
            <strong>Interest only on cash paid.</strong> For a late GSTR-3B, interest is charged on
            tax paid from the electronic cash ledger, not on tax paid from input tax credit. If the
            return is filed after proceedings under section 73, 74 or 74A have started, interest is
            on the full tax. This calculator does not cover that case.
          </li>
          <li>
            <strong>Three-year limit.</strong> The GST portal does not accept a return more than
            three years after its due date, from the July 2025 tax period. The calculator warns when
            the filing date is past that limit.
          </li>
        </ul>
      </GuideSection>

      <GuideSection id="assumptions" title="Supported period and assumptions">
        <p>
          Rules as in force in September 2026. GSTR-3B and GSTR-1 are supported for tax periods from
          June 2021, with due dates from 1 July 2021. GSTR-9 is supported from FY 2022-23.
        </p>
        <ul>
          <li>The tax is taken as paid on the filing date.</li>
          <li>Interest uses a 365-day year, including in leap years.</li>
          <li>Late fee and interest are rounded to the nearest rupee.</li>
          <li>
            One-off waivers, amnesty schemes and due date extensions are not applied. Enter the
            extended due date if there was one.
          </li>
          <li>GSTR-9 is optional for aggregate turnover up to ₹2 crore.</li>
          <li>
            GSTR-4, GSTR-9C, CMP-08 and interest on wrongly availed input tax credit under section
            50(3) are not covered.
          </li>
          <li>Check the amount on the GST portal before paying.</li>
        </ul>
      </GuideSection>

      <GuideSection id="references" title="References">
        <ul>
          {gstLateFeeCitations.map(({ source }) => (
            <li key={source.id}>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.reference}
              </a>
              : {source.title}
            </li>
          ))}
        </ul>
      </GuideSection>

      <GuideSection id="related-calculators" title="Related calculators">
        <RelatedTools
          slugs={['tds-interest', 'advance-tax']}
          reasons={{
            'tds-interest': 'Interest on TDS deducted or paid late.',
            'advance-tax': 'Income tax instalments and their due dates.',
          }}
        />
      </GuideSection>
    </>
  );
}
