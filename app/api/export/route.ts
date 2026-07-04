import { NextRequest, NextResponse } from 'next/server';

interface TxRow {
  date: string;
  amount: number;
  category: string;
  description: string;
  type?: string;
}

export async function POST(req: NextRequest) {
  const { transactions } = (await req.json()) as { transactions: TxRow[] };

  const header = 'Date,Type,Amount,Category,Description';
  const rows = transactions.map(
    (t) =>
      `${t.date},${t.type ?? 'expense'},${t.amount.toFixed(2)},${t.category},"${(t.description ?? '').replace(/"/g, '""')}"`
  );
  const csv = [header, ...rows].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="transactions.csv"',
    },
  });
}
