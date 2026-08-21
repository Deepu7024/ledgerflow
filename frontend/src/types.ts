export type Category =
  | 'Entertainment'
  | 'Food & Dining'
  | 'Shopping'
  | 'Utilities'
  | 'Groceries'
  | 'Travel'
  | 'Health'
  | 'Business'
  | 'Personal'
  | 'Other';

export type Source = 'SMS' | 'Cash' | 'PhonePe' | 'Email';

export interface Transaction {
  id: string;
  merchant: string;
  category: Category;
  /** Full amount of the transaction. */
  amount: number;
  /** When isSplit is true, this is the portion attributable to the user. */
  shareAmount?: number;
  date: string; // ISO 8601
  source: Source;
  isBusiness: boolean;
  isTransfer: boolean;
  isSplit: boolean;
}

export type ManualExpenseInput = {
  merchant: string;
  amount: number;
  category: Category;
  isCashEntry: boolean;
};

/** Response from POST /api/agent/sync-mail. */
export type MailSyncResult = {
  scanned: number;
  already_processed: number;
  added: number;
  skipped: number;
  errors: string[];
};

/** Amount that actually counts against the user's own spending. */
export function effectiveAmount(tx: Transaction): number {
  if (tx.isSplit && typeof tx.shareAmount === 'number') return tx.shareAmount;
  return tx.amount;
}
