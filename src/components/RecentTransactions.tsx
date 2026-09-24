"use client";

import React from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  Banknote,
  MoreHorizontal,
} from "lucide-react";
import { IExpense } from "@/types";
import { useCurrency } from "@/context/CurrencyContext";

interface RecentTransactionsProps {
  expenses: IExpense[];
  isLoading?: boolean;
  onEdit: (tx: IExpense) => void;
  onViewAll: () => void;
}

function paymentIcon(method?: string) {
  if (!method) return <CreditCard className="w-3 h-3 text-slate-500" />;
  const m = method.toLowerCase();
  if (m.includes("cash")) return <Banknote className="w-3 h-3 text-green-400" />;
  if (m.includes("sewa") || m.includes("wallet") || m.includes("upi"))
    return <Wallet className="w-3 h-3 text-cyan-400" />;
  return <CreditCard className="w-3 h-3 text-slate-500" />;
}

// Map category to an emoji for quick visual scanning
const CAT_EMOJI: Record<string, string> = {
  "Food & Dining":      "🍜",
  "Transportation":     "🚗",
  "Housing & Rent":     "🏠",
  "Utilities & Bills":  "⚡",
  "Entertainment":      "🎬",
  "Shopping":           "🛍️",
  "Health & Fitness":   "❤️",
  "Education":          "📚",
  "Travel":             "✈️",
  "Salary":             "💼",
  "Freelance & Business":"📈",
  "Investments":        "📊",
  "Gifts & Donations":  "🎁",
  "Other":              "📌",
};

export default function RecentTransactions({
  expenses,
  isLoading = false,
  onEdit,
  onViewAll,
}: RecentTransactionsProps) {
  const { formatAmount } = useCurrency();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-white/[0.03] border border-white/[0.05] animate-pulse" />
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="text-3xl mb-2">🧾</div>
        <p className="text-sm font-semibold text-slate-300">No transactions yet</p>
        <p className="text-xs text-slate-500 mt-1">Tap Add to record your first one.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {expenses.map((tx) => {
        const isIncome = tx.type === "income";
        const emoji    = CAT_EMOJI[tx.category] ?? "📌";
        const payDisplay = tx.paymentMethod === "Online / UPI" ? "e-Sewa" : (tx.paymentMethod ?? "");
        const dateStr  = new Date(tx.date).toLocaleDateString("en-US", {
          month: "short",
          day:   "numeric",
        });

        return (
          <div
            key={tx._id}
            onClick={() => onEdit(tx)}
            className="flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.10] transition-all cursor-pointer group"
          >
            {/* Category emoji badge */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
              isIncome ? "bg-emerald-500/10" : "bg-rose-500/10"
            }`}>
              {emoji}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-white truncate leading-tight">{tx.title}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                <span>{dateStr}</span>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  {paymentIcon(tx.paymentMethod)}
                  <span className="truncate max-w-[80px]">{payDisplay}</span>
                </span>
              </div>
            </div>

            {/* Amount */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-right">
                <div className={`text-sm font-bold font-mono leading-tight ${
                  isIncome ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {isIncome ? "+" : "−"}{formatAmount(tx.amount)}
                </div>
                <div className="text-[10px] text-slate-500 text-right truncate max-w-[64px]">
                  {tx.category}
                </div>
              </div>
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isIncome ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
              }`}>
                {isIncome
                  ? <ArrowUpRight className="w-3.5 h-3.5" />
                  : <ArrowDownRight className="w-3.5 h-3.5" />}
              </div>
            </div>
          </div>
        );
      })}

      {/* View all */}
      <button
        type="button"
        onClick={onViewAll}
        className="w-full flex items-center justify-center gap-1.5 py-3 rounded-2xl text-xs font-semibold text-slate-400 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.10] transition mt-1"
      >
        <MoreHorizontal className="w-4 h-4" />
        View all transactions
      </button>
    </div>
  );
}
