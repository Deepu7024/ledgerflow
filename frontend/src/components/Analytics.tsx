import React, { useMemo } from 'react';
import { Category, Transaction, effectiveAmount } from '../types';
import { formatCurrency } from '../utils/format';

interface AnalyticsProps {
  transactions: Transaction[];
}

const BAR_COLOR: Record<Category, string> = {
  'Food & Dining': 'bg-orange-400',
  Entertainment: 'bg-fuchsia-400',
  Shopping: 'bg-sky-400',
  Utilities: 'bg-amber-400',
  Groceries: 'bg-lime-400',
  Travel: 'bg-indigo-400',
  Health: 'bg-rose-400',
  Business: 'bg-cyan-400',
  Personal: 'bg-emerald-400',
  Other: 'bg-zinc-400',
};

export default function Analytics({ transactions }: AnalyticsProps) {
  const spendable = useMemo(() => transactions.filter((t) => !t.isTransfer), [transactions]);

  const byCategory = useMemo(() => {
    const totals = new Map<Category, number>();
    for (const tx of spendable) {
      totals.set(tx.category, (totals.get(tx.category) ?? 0) + effectiveAmount(tx));
    }
    const max = Math.max(1, ...Array.from(totals.values()));
    return Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category, total]) => ({ category, total, pct: Math.round((total / max) * 100) }));
  }, [spendable]);

  const { personalTotal, businessTotal } = useMemo(() => {
    let personal = 0;
    let business = 0;
    for (const tx of spendable) {
      if (tx.isBusiness) business += effectiveAmount(tx);
      else personal += effectiveAmount(tx);
    }
    return { personalTotal: personal, businessTotal: business };
  }, [spendable]);

  const total = personalTotal + businessTotal || 1;
  const businessDeg = (businessTotal / total) * 360;

  const bySource = useMemo(() => {
    const totals = new Map<string, number>();
    for (const tx of spendable) {
      totals.set(tx.source, (totals.get(tx.source) ?? 0) + effectiveAmount(tx));
    }
    return Array.from(totals.entries()).sort((a, b) => b[1] - a[1]);
  }, [spendable]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Category breakdown */}
      <div className="rounded-2xl border border-white/5 bg-zinc-900/60 p-5 lg:col-span-2">
        <h3 className="text-sm font-semibold text-zinc-100">Spending by category</h3>
        <p className="mt-0.5 text-xs text-zinc-500">Internal transfers excluded</p>

        <div className="mt-5 space-y-3.5">
          {byCategory.map(({ category, total, pct }) => (
            <div key={category}>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-zinc-300">{category}</span>
                <span className="text-zinc-500">{formatCurrency(total)}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                <div className={`h-full rounded-full ${BAR_COLOR[category]}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
          {byCategory.length === 0 && <p className="text-sm text-zinc-500">No data yet.</p>}
        </div>
      </div>

      {/* Business vs Personal donut */}
      <div className="rounded-2xl border border-white/5 bg-zinc-900/60 p-5">
        <h3 className="text-sm font-semibold text-zinc-100">Business vs Personal</h3>
        <div className="mt-6 flex items-center justify-center">
          <div
            className="relative flex h-40 w-40 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(#22d3ee ${businessDeg}deg, #10b981 0deg)`,
            }}
          >
            <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-zinc-900">
              <span className="text-lg font-semibold text-zinc-50">{formatCurrency(total)}</span>
              <span className="text-[11px] text-zinc-500">total</span>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-center gap-6 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Personal · {formatCurrency(personalTotal)}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            Business · {formatCurrency(businessTotal)}
          </div>
        </div>
      </div>

      {/* By source */}
      <div className="rounded-2xl border border-white/5 bg-zinc-900/60 p-5">
        <h3 className="text-sm font-semibold text-zinc-100">Spending by source</h3>
        <div className="mt-5 space-y-4">
          {bySource.map(([source, total]) => (
            <div key={source} className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">{source}</span>
              <span className="text-sm font-medium text-zinc-100">{formatCurrency(total)}</span>
            </div>
          ))}
          {bySource.length === 0 && <p className="text-sm text-zinc-500">No data yet.</p>}
        </div>
      </div>
    </div>
  );
}
