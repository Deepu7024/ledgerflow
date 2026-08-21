import React from 'react';
import { X, PenLine } from 'lucide-react';
import { ManualExpenseInput } from '../types';
import ManualEntryForm from './ManualEntryForm';

interface ManualEntryModalProps {
  onClose: () => void;
  onSubmit: (input: ManualExpenseInput) => Promise<void> | void;
  submitting?: boolean;
}

export default function ManualEntryModal({ onClose, onSubmit, submitting }: ManualEntryModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md animate-fade-in rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-glow-lg">
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/25">
              <PenLine size={16} className="text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-100">Log a cash expense</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-zinc-500 hover:bg-white/5 hover:text-zinc-300">
            <X size={16} />
          </button>
        </div>

        <ManualEntryForm onSubmit={onSubmit} submitting={submitting} onCancel={onClose} />
      </div>
    </div>
  );
}
