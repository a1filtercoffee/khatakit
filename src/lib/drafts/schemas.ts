import { z } from 'zod';
const amount = z.number().finite();
const date = z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/);
export const advanceDraft = z.object({
  regime: z.enum(['new', 'old']), grossIncome: amount, salaryIncome: amount,
  deductions: amount, tdsDeducted: amount, ageCategory: z.enum(['below60', '60to80', 'above80']),
  hasBusinessIncome: z.boolean(),
});
export const presumptiveDraft = z.object({
  scheme: z.enum(['44AD', '44ADA']), regime: z.enum(['new', 'old']),
  grossReceipts: amount, cashReceipts: amount,
});
export const gstDraft = z.object({
  returnType: z.enum(['GSTR-3B', 'GSTR-1', 'GSTR-9']), dueDate: date, filingDate: date,
  taxLiability: amount, turnoverSlab: z.enum(['upto_1_5cr', '1_5cr_to_5cr', 'above_5cr', 'upto_5cr', '5cr_to_20cr', 'above_20cr']),
  isNilReturn: z.boolean(), stateTurnover: amount.optional(),
});
export const tdsSingleDraft = z.object({ amount, deductible: date, deducted: date, deposited: date });
export const tdsRowsDraft = z.array(z.object({
  id: z.string(), label: z.string(), amount: z.string(), deductible: z.string(),
  deducted: z.string(), deposited: z.string(),
})).min(1).max(1000);
export const tdsModeDraft = z.enum(['single', 'bulk']);
export const deductorDraft = z.enum(['non-government', 'government-challan', 'government-book-entry']);
export const enteredDateDraft = date.nullable();
export const booleanDraft = z.boolean();
export const paymentsDraft = z.array(z.object({ id: z.number().int(), date, amount })).max(1000);
