export function monthlyDueDate(period: string, returnType: 'GSTR-1' | 'GSTR-3B'): string | null {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period) || period < '2021-06') return null;
  const [year, month] = period.split('-').map(Number);
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  return `${nextYear}-${String(nextMonth).padStart(2, '0')}-${returnType === 'GSTR-1' ? '11' : '20'}`;
}
