import React from 'react';
import { LayoutDashboard, Receipt, PenLine, BarChart3, Wallet, X } from 'lucide-react';

export type View = 'dashboard' | 'transactions' | 'manual' | 'analytics';

interface NavItem {
  key: View;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'transactions', label: 'Transactions', icon: Receipt },
  { key: 'manual', label: 'Manual Entry', icon: PenLine },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
];

interface SidebarProps {
  active: View;
  onNavigate: (view: View) => void;
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ active, onNavigate, open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile scrim */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 shrink-0 transform border-r border-white/5 bg-zinc-950 transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/25">
              <Wallet size={18} className="text-emerald-400" />
            </div>
            <span className="text-base font-semibold tracking-tight text-zinc-100">
              Expensely
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/5 hover:text-zinc-300 lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="mt-2 flex flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onNavigate(item.key);
                  onClose();
                }}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/20'
                    : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                }`}
              >
                <Icon
                  size={18}
                  className={isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-300'}
                />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-white/5 p-4">
          <div className="rounded-xl bg-white/[0.03] p-3 text-xs text-zinc-500">
            Connected to
            <div className="mt-0.5 truncate font-mono text-[11px] text-zinc-400">
              your-backend.onrender.com
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
