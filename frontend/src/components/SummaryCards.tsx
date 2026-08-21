import React, { useMemo, useState } from 'react';
import { Wallet, Briefcase, User, Target } from 'lucide-react';
import { Transaction, effectiveAmount } from '../types';
import { formatCurrency } from '../utils/format';
import { SummaryCardSkeleton } from './Skeletons';

interface SummaryCardsProps {
  transactions: Transaction[];
  loading: boolean;
  monthlyBudget: number;
}

export default function SummaryCards({ transactions, loading, monthlyBudget }: SummaryCardsProps) {
  const [view, setView] = useState<'personal' | 'business'>('personal');

  const { personalTotal, businessTotal, transferTotal } = useMemo(() => {
    let personal = 0;
    let business = 0;
    let transfer = 0;
    for (const tx of transactions) {
      const amount = effectiveAmount(tx);
      if (tx.isTransfer) {
        transfer += amount;
      } else if (tx.isBusiness) {
        business += amount;
      } else {
        personal += amount;
      }
    }
    return { personalTotal: personal, businessTotal: business, transferTotal: transfer };
  }, [transactions]);

  const combined = personalTotal + businessTotal || 1;
  const personalPct = Math.round((personalTotal / combined) * 100);
  const businessPct = 100 - personalPct;
  const budgetPct = Math.min(100, Math.round((personalTotal / monthlyBudget) * 100));
  const budgetColor =
    budgetPct >= 100 ? 'bg-red-500' : budgetPct >= 80 ? 'bg-amber-400' : 'bg-emerald-500';

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {/* Total Personal Spent */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-zinc-900/60 p-5 shadow-glow">
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Total Personal Spent
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/25">
            <Wallet size={15} className="text-emerald-400" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-semibold tracking-tight text-zinc-50">
          {formatCurrency(personalTotal)}
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Excludes business expenses &amp; internal transfers
          {transferTotal > 0 && (
            <span className="text-zinc-600"> · {formatCurrency(transferTotal)} transferred</span>
          )}
        </p>
      </div>

      {/* Business vs Personal */}
      <div className="rounded-2xl border border-white/5 bg-zinc-900/60 p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Business vs Personal
          </span>
          <div className="flex rounded-lg bg-white/5 p-0.5 text-xs font-medium">
            <button
              onClick={() => setView('personal')}
              className={`flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${
                view === 'personal' ? 'bg-emerald-500/15 text-emerald-300' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <User size={12} /> Personal
            </button>
            <button
              onClick={() => setView('business')}
              className={`flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${
                view === 'business' ? 'bg-cyan-500/15 text-cyan-300' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Briefcase size={12} /> Business
            </button>
          </div>
        </div>

        <div className="mt-3 text-2xl font-semibold tracking-tight text-zinc-50">
          {formatCurrency(view === 'personal' ? personalTotal : businessTotal)}
        </div>

        <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-white/5">
          <div className="h-full bg-emerald-500" style={{ width: `${personalPct}%` }} />
          <div className="h-full bg-cyan-500" style={{ width: `${businessPct}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-zinc-500">
          <span>Personal {personalPct}%</span>
          <span>Business {businessPct}%</span>
        </div>
      </div>

      {/* Monthly Budget Progress */}
      <div className="rounded-2xl border border-white/5 bg-zinc-900/60 p-5 sm:col-span-2 xl:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Monthly Budget
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
            <Target size={15} className="text-zinc-300" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-semibold tracking-tight text-zinc-50">{budgetPct}%</span>
          <span className="text-xs text-zinc-500">of {formatCurrency(monthlyBudget)}</span>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className={`h-full rounded-full transition-all ${budgetColor}`}
            style={{ width: `${Math.min(100, (personalTotal / monthlyBudget) * 100)}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-zinc-500">
          {formatCurrency(Math.max(0, monthlyBudget - personalTotal))} remaining this month
        </p>
      </div>
    </div>
  );
}
