"use client";

import React from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  Banknote,
  MoreHorizontal,
  Calendar,
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
  if (!method) return <CreditCard className="w-3.5 h-3.5 text-slate-400" />;
  const m = method.toLowerCase();
  if (m.includes("cash")) return <Banknote className="w-3.5 h-3.5 text-emerald-400" />;
  if (m.includes("sewa") || m.includes("wallet") || m.includes("upi"))
    return <Wallet className="w-3.5 h-3.5 text-cyan-400" />;
  return <CreditCard className="w-3.5 h-3.5 text-slate-400" />;
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
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-white/[0.03] border border-white/[0.05] animate-pulse" />
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="text-3xl mb-2">🧾</div>
        <p className="text-base font-semibold text-slate-300">No transactions yet</p>
        <p className="text-sm text-slate-400 mt-1">Tap Add to record your first one.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((tx) => {
        const isIncome = tx.type === "income";
        const emoji    = CAT_EMOJI[tx.category] ?? "📌";
        const payDisplay =
          tx.paymentMethod === "Online / UPI" ? "e-Sewa / Wallet" : (tx.paymentMethod || "Other");
        const dateStr  = new Date(tx.date).toLocaleDateString("en-US", {
          month: "short",
          day:   "numeric",
          year:  "numeric",
        });

        return (
          <div
            key={tx._id}
            onClick={() => onEdit(tx)}
            className="rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.07] hover:border-white/[0.12] transition-all p-3.5 sm:p-4 cursor-pointer group shadow-sm space-y-3"
          >
            {/* Top Row: Avatar + Title & Category + Amount */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Category emoji badge */}
                <div className="relative flex-shrink-0">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl ${
                    isIncome
                      ? "bg-emerald-500/15 border border-emerald-500/25"
                      : "bg-rose-500/15 border border-rose-500/25"
                  }`}>
                    {emoji}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md ${
                    isIncome ? "bg-emerald-500 text-slate-950" : "bg-rose-500 text-white"
                  }`}>
                    {isIncome ? "+" : "−"}
                  </div>
                </div>

                {/* Title & category */}
                <div className="min-w-0 flex-1">
                  <h4 className="text-base font-bold text-white truncate leading-snug group-hover:text-blue-400 transition-colors">
                    {tx.title}
                  </h4>
                  <span className="inline-block mt-0.5 text-xs text-slate-400 font-medium">
                    {tx.category}
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right flex-shrink-0">
                <div className={`text-base sm:text-lg font-extrabold font-mono leading-tight ${
                  isIncome ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {isIncome ? "+" : "−"}{formatAmount(tx.amount)}
                </div>
                <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  isIncome
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}>
                  {isIncome ? "Income" : "Expense"}
                </span>
              </div>
            </div>

            {/* Bottom metadata strip: Date & Wallet */}
            <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-white/[0.05] text-xs">
              <div className="flex flex-wrap items-center gap-2">
                {/* Date */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-300 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>{dateStr}</span>
                </span>

                {/* Wallet / Payment */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-300 font-medium">
                  {paymentIcon(tx.paymentMethod)}
                  <span className="text-slate-200 font-semibold">{payDisplay}</span>
                </span>
              </div>

              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.04] text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-all flex-shrink-0">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        );
      })}

      {/* View all */}
      <button
        type="button"
        onClick={onViewAll}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] transition mt-1 shadow-sm"
      >
        <MoreHorizontal className="w-4 h-4" />
        View all transactions
      </button>
    </div>
  );
}
