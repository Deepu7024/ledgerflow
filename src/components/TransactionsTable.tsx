import React, { useMemo, useState } from 'react';
import { SplitSquareHorizontal, Briefcase, ArrowLeftRight, Search, Inbox } from 'lucide-react';
import { Category, Transaction } from '../types';
import { CATEGORIES } from '../constants';
import { formatCurrency, formatDate } from '../utils/format';
import CategoryBadge from './CategoryBadge';
import SourceIcon from './SourceIcon';
import TagMenu, { TagOption } from './TagMenu';
import { TableRowSkeleton } from './Skeletons';

interface TransactionsTableProps {
  transactions: Transaction[];
  loading: boolean;
  limit?: number;
  showFilters?: boolean;
  onSplit: (tx: Transaction) => void;
  onTagChange: (tx: Transaction, tag: TagOption) => void;
}

export default function TransactionsTable({
  transactions,
  loading,
  limit,
  showFilters = false,
  onSplit,
  onTagChange,
}: TransactionsTableProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | 'All'>('All');

  const filtered = useMemo(() => {
    let list = transactions;
    if (category !== 'All') list = list.filter((t) => t.category === category);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((t) => t.merchant.toLowerCase().includes(q));
    }
    const sorted = [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return limit ? sorted.slice(0, limit) : sorted;
  }, [transactions, query, category, limit]);

  return (
    <div className="rounded-2xl border border-white/5 bg-zinc-900/60">
      {showFilters && (
        <div className="flex flex-col gap-3 border-b border-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search merchant…"
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-8 pr-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category | 'All')}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
          >
            <option value="All">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-3 font-medium">Merchant</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center">
                  <div className="flex flex-col items-center gap-2 text-zinc-500">
                    <Inbox size={22} />
                    <span className="text-sm">No transactions found</span>
                  </div>
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((tx) => {
                const effective = tx.isSplit && tx.shareAmount != null ? tx.shareAmount : tx.amount;
                return (
                  <tr key={tx.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-4">
                      <div className="font-medium text-zinc-100">{tx.merchant}</div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {tx.isBusiness && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-300 ring-1 ring-inset ring-cyan-500/25">
                            <Briefcase size={10} /> Business
                          </span>
                        )}
                        {tx.isTransfer && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-500/10 px-2 py-0.5 text-[10px] font-medium text-zinc-400 ring-1 ring-inset ring-zinc-500/25">
                            <ArrowLeftRight size={10} /> Transfer · excluded
                          </span>
                        )}
                        {tx.isSplit && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-300 ring-1 ring-inset ring-violet-500/25">
                            <SplitSquareHorizontal size={10} /> Split
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <CategoryBadge category={tx.category} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-zinc-100">{formatCurrency(effective)}</div>
                      {tx.isSplit && (
                        <div className="text-[11px] text-zinc-500">of {formatCurrency(tx.amount)}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-zinc-400">{formatDate(tx.date)}</td>
                    <td className="px-4 py-4">
                      <SourceIcon source={tx.source} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSplit(tx)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10"
                        >
                          <SplitSquareHorizontal size={13} />
                          Split
                        </button>
                        <TagMenu transaction={tx} onChange={(tag) => onTagChange(tx, tag)} />
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
