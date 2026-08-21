import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, User, Briefcase, ArrowLeftRight, Check } from 'lucide-react';
import { Transaction } from '../types';

export type TagOption = 'personal' | 'business' | 'transfer';

interface TagMenuProps {
  transaction: Transaction;
  onChange: (tag: TagOption) => void;
}

const OPTIONS: { key: TagOption; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; dot: string }[] = [
  { key: 'personal', label: 'Personal', icon: User, dot: 'bg-emerald-400' },
  { key: 'business', label: 'Business', icon: Briefcase, dot: 'bg-cyan-400' },
  { key: 'transfer', label: 'Internal Transfer', icon: ArrowLeftRight, dot: 'bg-zinc-400' },
];

function currentTag(tx: Transaction): TagOption {
  if (tx.isTransfer) return 'transfer';
  if (tx.isBusiness) return 'business';
  return 'personal';
}

export default function TagMenu({ transaction, onChange }: TagMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = currentTag(transaction);
  const ActiveIcon = OPTIONS.find((o) => o.key === active)!.icon;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10"
      >
        <ActiveIcon size={13} />
        {OPTIONS.find((o) => o.key === active)!.label}
        <ChevronDown size={13} className="text-zinc-500" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1.5 w-48 animate-fade-in overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-glow-lg">
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            const isActive = option.key === active;
            return (
              <button
                key={option.key}
                onClick={() => {
                  onChange(option.key);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs text-zinc-300 hover:bg-white/5"
              >
                <span className={`h-1.5 w-1.5 rounded-full ${option.dot}`} />
                <Icon size={13} className="text-zinc-500" />
                <span className="flex-1">{option.label}</span>
                {isActive && <Check size={13} className="text-emerald-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
