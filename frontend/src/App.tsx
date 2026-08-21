import React, { useCallback, useEffect, useState } from 'react';
import { Mail, Menu, Plus, RefreshCw } from 'lucide-react';
import Sidebar, { View } from './components/Sidebar';
import SummaryCards from './components/SummaryCards';
import TransactionsTable from './components/TransactionsTable';
import SplitModal from './components/SplitModal';
import ManualEntryModal from './components/ManualEntryModal';
import ManualEntryForm from './components/ManualEntryForm';
import Analytics from './components/Analytics';
import ErrorBanner from './components/ErrorBanner';
import ToastStack, { ToastMessage } from './components/Toast';
import { TagOption } from './components/TagMenu';
import { createManualExpense, fetchExpenses, syncMail, updateExpense } from './api';
import { ManualExpenseInput, Transaction } from './types';
import { MONTHLY_BUDGET_DEFAULT, SEED_TRANSACTIONS } from './constants';

let toastId = 0;

const VIEW_TITLES: Record<View, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Your spending at a glance' },
  transactions: { title: 'Transactions', subtitle: 'Every expense, synced and searchable' },
  manual: { title: 'Manual Entry', subtitle: 'Log a cash expense by hand' },
  analytics: { title: 'Analytics', subtitle: 'Where your money actually goes' },
};

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingDemoData, setUsingDemoData] = useState(false);

  const [splitTarget, setSplitTarget] = useState<Transaction | null>(null);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [savingSplit, setSavingSplit] = useState(false);
  const [savingManual, setSavingManual] = useState(false);
  const [syncingMail, setSyncingMail] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback((text: string, variant: ToastMessage['variant']) => {
    toastId += 1;
    setToasts((prev) => [...prev, { id: toastId, text, variant }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchExpenses();
      setTransactions(data);
      setUsingDemoData(false);
    } catch (err) {
      // The API base URL is a placeholder until a real backend is deployed.
      // Fall back to seed data so the dashboard still demonstrates real behavior.
      setError(
        err instanceof Error
          ? `Couldn't reach the API (${err.message}).`
          : "Couldn't reach the API."
      );
      setTransactions(SEED_TRANSACTIONS);
      setUsingDemoData(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  async function handleSplitConfirm(shareAmount: number) {
    if (!splitTarget) return;
    setSavingSplit(true);
    const updated: Transaction = { ...splitTarget, isSplit: true, shareAmount };
    try {
      await updateExpense(splitTarget.id, { isSplit: true, shareAmount });
      pushToast('Split saved.', 'success');
    } catch {
      pushToast('Could not sync split to server — saved locally.', 'error');
    } finally {
      setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setSavingSplit(false);
      setSplitTarget(null);
    }
  }

  async function handleTagChange(tx: Transaction, tag: TagOption) {
    const patch =
      tag === 'business'
        ? { isBusiness: true, isTransfer: false }
        : tag === 'transfer'
        ? { isBusiness: false, isTransfer: true }
        : { isBusiness: false, isTransfer: false };

    const updated: Transaction = { ...tx, ...patch };
    setTransactions((prev) => prev.map((t) => (t.id === tx.id ? updated : t)));

    try {
      await updateExpense(tx.id, patch);
    } catch {
      pushToast('Could not sync tag change to server — saved locally.', 'error');
    }
  }

  async function handleManualSubmit(input: ManualExpenseInput) {
    setSavingManual(true);
    const optimistic: Transaction = {
      id: `local_${Date.now()}`,
      merchant: input.merchant,
      category: input.category,
      amount: input.amount,
      date: new Date().toISOString(),
      source: input.isCashEntry ? 'Cash' : 'SMS',
      isBusiness: false,
      isTransfer: false,
      isSplit: false,
    };

    try {
      const saved = await createManualExpense(input);
      setTransactions((prev) => [saved, ...prev]);
      pushToast('Expense added.', 'success');
    } catch {
      setTransactions((prev) => [optimistic, ...prev]);
      pushToast('Could not sync to server — saved locally.', 'error');
    } finally {
      setSavingManual(false);
      setManualModalOpen(false);
    }
  }

  async function handleSyncMail() {
    setSyncingMail(true);
    try {
      const result = await syncMail();
      if (result.added > 0) {
        await loadExpenses();
      }
      pushToast(
        `Mail sync: ${result.added} added, ${result.skipped} skipped, ${result.scanned} scanned.`,
        'success'
      );
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Mail sync failed.', 'error');
    } finally {
      setSyncingMail(false);
    }
  }

  const { title, subtitle } = VIEW_TITLES[view];

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar active={view} onNavigate={setView} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-white/5 bg-zinc-950/80 px-4 backdrop-blur sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-zinc-200 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-zinc-100">{title}</h1>
            <p className="hidden truncate text-xs text-zinc-500 sm:block">{subtitle}</p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={loadExpenses}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/10"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleSyncMail}
              disabled={syncingMail}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Mail size={14} className={syncingMail ? 'animate-pulse' : ''} />
              <span className="hidden sm:inline">{syncingMail ? 'Syncing…' : 'Sync from Mail'}</span>
            </button>
            <button
              onClick={() => setManualModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-medium text-emerald-950 hover:bg-emerald-400"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Add Cash Expense</span>
            </button>
          </div>
        </header>

        <main className="flex-1 space-y-5 p-4 sm:p-6">
          {error && (
            <ErrorBanner
              message={`${error}${usingDemoData ? ' Showing demo data instead.' : ''}`}
              onRetry={loadExpenses}
            />
          )}

          {view === 'dashboard' && (
            <>
              <SummaryCards transactions={transactions} loading={loading} monthlyBudget={MONTHLY_BUDGET_DEFAULT} />
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-zinc-200">Recent transactions</h2>
                  <button
                    onClick={() => setView('transactions')}
                    className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
                  >
                    View all
                  </button>
                </div>
                <TransactionsTable
                  transactions={transactions}
                  loading={loading}
                  limit={6}
                  onSplit={setSplitTarget}
                  onTagChange={handleTagChange}
                />
              </div>
            </>
          )}

          {view === 'transactions' && (
            <TransactionsTable
              transactions={transactions}
              loading={loading}
              showFilters
              onSplit={setSplitTarget}
              onTagChange={handleTagChange}
            />
          )}

          {view === 'manual' && (
            <div className="mx-auto max-w-md rounded-2xl border border-white/5 bg-zinc-900/60 p-6">
              <h2 className="text-sm font-semibold text-zinc-100">Log a cash expense</h2>
              <p className="mt-1 text-xs text-zinc-500">
                Cash purchases don't hit your bank SMS or PhonePe feed — add them here so they count
                toward your totals.
              </p>
              <div className="mt-5">
                <ManualEntryForm onSubmit={handleManualSubmit} submitting={savingManual} />
              </div>
            </div>
          )}

          {view === 'analytics' && <Analytics transactions={transactions} />}
        </main>
      </div>

      {splitTarget && (
        <SplitModal
          transaction={splitTarget}
          onClose={() => setSplitTarget(null)}
          onConfirm={handleSplitConfirm}
          submitting={savingSplit}
        />
      )}

      {manualModalOpen && (
        <ManualEntryModal
          onClose={() => setManualModalOpen(false)}
          onSubmit={handleManualSubmit}
          submitting={savingManual}
        />
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
