import { API_BASE_URL } from './constants';
import { MailSyncResult, ManualExpenseInput, Transaction } from './types';

export class ApiError extends Error {}

/**
 * GET /api/expenses
 */
export async function fetchExpenses(signal?: AbortSignal): Promise<Transaction[]> {
  const res = await fetch(`${API_BASE_URL}/expenses`, { signal });
  if (!res.ok) {
    throw new ApiError(`Failed to load transactions (${res.status})`);
  }
  return res.json();
}

/**
 * POST /api/expenses/manual
 */
export async function createManualExpense(input: ManualExpenseInput): Promise<Transaction> {
  const res = await fetch(`${API_BASE_URL}/expenses/manual`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new ApiError(`Failed to save expense (${res.status})`);
  }
  return res.json();
}

/**
 * PATCH /api/expenses/:id
 * Used for tag toggles (personal/business/transfer) and split-share updates.
 */
export async function updateExpense(
  id: string,
  patch: Partial<Pick<Transaction, 'isBusiness' | 'isTransfer' | 'isSplit' | 'shareAmount'>>
): Promise<Transaction> {
  const res = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    throw new ApiError(`Failed to update expense (${res.status})`);
  }
  return res.json();
}

/**
 * POST /api/agent/sync-mail
 * Triggers the mail-reading agent: scans recent email, has Claude classify
 * and extract each candidate transaction, and inserts any real matches.
 */
export async function syncMail(): Promise<MailSyncResult> {
  const res = await fetch(`${API_BASE_URL}/agent/sync-mail`, { method: 'POST' });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.detail ?? `Mail sync failed (${res.status})`);
  }
  return res.json();
}
