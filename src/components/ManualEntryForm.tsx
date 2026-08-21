import React, { useState } from 'react';
import { Banknote } from 'lucide-react';
import { Category, ManualExpenseInput } from '../types';
import { CATEGORIES } from '../constants';

interface ManualEntryFormProps {
  onSubmit: (input: ManualExpenseInput) => Promise<void> | void;
  submitting?: boolean;
  onCancel?: () => void;
}

export default function ManualEntryForm({ onSubmit, submitting, onCancel }: ManualEntryFormProps) {
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState<Category>('Food & Dining');
  const [isCashEntry, setIsCashEntry] = useState(true);

  const amountValue = parseFloat(amount);
  const isValid = merchant.trim().length > 0 && !Number.isNaN(amountValue) && amountValue > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    await onSubmit({ merchant: merchant.trim(), amount: amountValue, category, isCashEntry });
    setAmount('');
    setMerchant('');
    setCategory('Food & Dining');
    setIsCashEntry(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-zinc-400">Amount</label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-zinc-500">
            ₹
          </span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-7 pr-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-zinc-400">Merchant name</label>
        <input
          type="text"
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
          placeholder="e.g. Corner Store"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-zinc-400">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-300">
        <input
          type="checkbox"
          checked={isCashEntry}
          onChange={(e) => setIsCashEntry(e.target.checked)}
          className="h-4 w-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/50"
        />
        <Banknote size={15} className="text-amber-400" />
        Is Cash Entry
      </label>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!isValid || submitting}
          className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-emerald-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? 'Saving…' : 'Add expense'}
        </button>
      </div>
    </form>
  );
}
