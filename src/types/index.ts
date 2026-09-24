export type TransactionType = "expense" | "income";

export interface IUser {
  id: string;
  name: string;
  email: string;
  currency?: string;
}

export type ExpenseCategory =
  | "Food & Dining"
  | "Transportation"
  | "Housing & Rent"
  | "Utilities & Bills"
  | "Entertainment"
  | "Shopping"
  | "Health & Fitness"
  | "Education"
  | "Travel"
  | "Salary"
  | "Freelance & Business"
  | "Investments"
  | "Gifts & Donations"
  | "Other";

export type PaymentMethod =
  | "Cash"
  | "Credit Card"
  | "Debit Card"
  | "e-Sewa / Wallet"
  | "Online / UPI"
  | "Bank Transfer"
  | "Crypto / Other";

export type NoteCategory =
  | "General"
  | "Budget Planning"
  | "Receipt & Bills"
  | "Shopping List"
  | "Financial Goals"
  | "Tax & Accounting"
  | "Investment Idea";

export interface IExpense {
  _id?: string;
  userId?: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: ExpenseCategory | string;
  date: string;
  paymentMethod: PaymentMethod | string;
  notes?: string;
  tags?: string[];
  linkedNoteId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface INote {
  _id?: string;
  userId?: string;
  title: string;
  content: string; // HTML formatted string with H1, H2, bold, color, etc.
  plainText?: string;
  category: NoteCategory | string;
  color?: string; // Theme accent for the note card
  isPinned?: boolean;
  handwritingDataUrl?: string; // Base64 drawing canvas sketch for mobile
  tags?: string[];
  linkedExpenseId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICategoryStat {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  color?: string;
}

export interface ITrendPoint {
  date: string;
  income: number;
  expense: number;
  net?: number;
}

export interface IPaymentStat {
  method: string;
  amount: number;
  count: number;
}

export interface IDashboardStats {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number;
  transactionCount: number;
  avgDailyExpense: number;
  topCategory: { category: string; amount: number } | null;
  categoryBreakdown: ICategoryStat[];
  dailyTrends: ITrendPoint[];
  monthlyTrends: { month: string; income: number; expense: number }[];
  paymentMethodBreakdown: IPaymentStat[];
}
