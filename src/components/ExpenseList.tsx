"use client";

import React, { useState } from "react";
import {
  Search, SlidersHorizontal, Trash2, Edit2, FileText,
  Wallet, CreditCard, Plus, ArrowUpRight, ArrowDownRight, X,
} from "lucide-react";
import { IExpense, ExpenseCategory, TransactionType } from "@/types";
import { useCurrency } from "@/context/CurrencyContext";

interface ExpenseListProps {
  expenses: IExpense[];
  isLoading?: boolean;
  onEdit: (expense: IExpense) => void;
  onDelete: (id: string) => Promise<void>;
  onAddNew: () => void;
  onViewNote?: (noteId: string) => void;
}

const CATEGORIES: (ExpenseCategory | "All")[] = [
  "All", "Food & Dining", "Transportation", "Housing & Rent",
  "Utilities & Bills", "Entertainment", "Shopping",
  "Health & Fitness", "Education", "Salary",
  "Freelance & Business", "Investments", "Other",
];

export default function ExpenseList({
  expenses,
  isLoading = false,
  onEdit,
  onDelete,
  onAddNew,
  onViewNote,
}: ExpenseListProps) {
  const { formatAmount } = useCurrency();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState<TransactionType | "all">("all");
  const [sort, setSort] = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc">("date-desc");
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = expenses
    .filter((tx) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        tx.title.toLowerCase().includes(q) ||
        tx.notes?.toLowerCase().includes(q) ||
        tx.tags?.some((t) => t.toLowerCase().includes(q));
      const matchCat = category === "All" || tx.category === category;
      const matchType = type === "all" || tx.type === type;
      return matchSearch && matchCat && matchType;
    })
    .sort((a, b) => {
      switch (sort) {
        case "date-desc":   return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-asc":    return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "amount-desc": return b.amount - a.amount;
        case "amount-asc":  return a.amount - b.amount;
        default:            return 0;
      }
    });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this transaction?")) return;
    setDeletingId(id);
    try { await onDelete(id); }
    finally { setDeletingId(null); }
  };

  const hasActiveFilters = category !== "All" || type !== "all" || sort !== "date-desc";

  return (
    <div className="space-y-3">

      {/* ── Search + Filter Bar ── */}
      <div className="space-y-2">
        <div className="flex gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions…"
              className="w-full h-10 pl-9 pr-9 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`h-10 w-10 flex items-center justify-center rounded-xl border transition relative ${
              hasActiveFilters
                ? "bg-blue-600/20 border-blue-500/60 text-blue-400"
                : "bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white hover:border-white/[0.14]"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500" />
            )}
          </button>

          {/* Add button */}
          <button
            type="button"
            onClick={onAddNew}
            className="h-10 flex items-center gap-1.5 px-3.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/25 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="animate-fade-up p-3 bg-white/[0.03] border border-white/[0.07] rounded-2xl space-y-2.5">
            {/* Type filter */}
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Type</label>
              <div className="flex gap-1.5">
                {(["all", "expense", "income"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 h-8 rounded-lg text-xs font-medium transition ${
                      type === t
                        ? t === "expense"
                          ? "bg-rose-600/25 text-rose-300 border border-rose-500/50"
                          : t === "income"
                          ? "bg-emerald-600/25 text-emerald-300 border border-emerald-500/50"
                          : "bg-white/[0.10] text-white border border-white/[0.15]"
                        : "bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:text-white"
                    }`}
                  >
                    {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-9 px-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#111827]">
                    {c === "All" ? "All Categories" : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Sort by</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="w-full h-9 px-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 cursor-pointer"
              >
                <option value="date-desc" className="bg-[#111827]">Newest first</option>
                <option value="date-asc"  className="bg-[#111827]">Oldest first</option>
                <option value="amount-desc" className="bg-[#111827]">Highest amount</option>
                <option value="amount-asc"  className="bg-[#111827]">Lowest amount</option>
              </select>
            </div>

            {/* Reset */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => { setCategory("All"); setType("all"); setSort("date-desc"); }}
                className="w-full h-8 text-xs text-slate-400 hover:text-white border border-white/[0.07] rounded-lg transition"
              >
                Reset filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Transaction Count ── */}
      {!isLoading && filtered.length > 0 && (
        <p className="text-[11px] text-slate-500 px-1">
          {filtered.length} of {expenses.length} transaction{expenses.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* ── List ── */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[72px] rounded-2xl bg-white/[0.03] border border-white/[0.05] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-3">
            <Search className="w-6 h-6 text-slate-600" />
          </div>
          <h4 className="text-sm font-semibold text-slate-300 mb-1">
            {expenses.length === 0 ? "No transactions yet" : "Nothing matches"}
          </h4>
          <p className="text-xs text-slate-500 max-w-xs">
            {expenses.length === 0
              ? "Tap the Add button to record your first transaction."
              : "Try adjusting your search or filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((tx) => {
            const isIncome = tx.type === "income";
            const dateStr = new Date(tx.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const payDisplay =
              tx.paymentMethod === "Online / UPI" ? "e-Sewa / Wallet" : tx.paymentMethod;
            const isWallet =
              tx.paymentMethod === "e-Sewa / Wallet" || tx.paymentMethod === "Online / UPI";

            return (
              <div
                key={tx._id}
                className="group flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.10] transition-all"
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isIncome
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-rose-500/10 text-rose-400"
                }`}>
                  {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-white truncate">{tx.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-slate-400 border border-white/[0.07] whitespace-nowrap hidden sm:inline">
                      {tx.category}
                    </span>
                    {tx.linkedNoteId && (
                      <button
                        type="button"
                        onClick={() => {
                          const id = typeof tx.linkedNoteId === "object"
                            ? (tx.linkedNoteId as { _id: string })._id
                            : tx.linkedNoteId as string;
                          onViewNote?.(id);
                        }}
                        className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-400 border border-indigo-700/40 hover:bg-indigo-900/40 transition"
                      >
                        <FileText className="w-2.5 h-2.5" />
                        Note
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px] text-slate-500">
                    <span>{dateStr}</span>
                    <span className="flex items-center gap-1">
                      {isWallet
                        ? <Wallet className="w-3 h-3 text-cyan-400" />
                        : <CreditCard className="w-3 h-3" />}
                      {payDisplay}
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <div className={`text-base font-bold font-mono flex-shrink-0 ${
                  isIncome ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {formatAmount(tx.amount, { showSign: true, isExpense: !isIncome })}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => onEdit(tx)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.05] text-slate-400 hover:text-white hover:bg-white/[0.10] transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => tx._id && handleDelete(tx._id)}
                    disabled={deletingId === tx._id}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-950/50 text-rose-400 hover:bg-rose-900/60 border border-rose-800/30 transition disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
