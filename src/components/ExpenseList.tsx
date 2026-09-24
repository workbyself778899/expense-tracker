"use client";

import React, { useState } from "react";
import {
  Search, SlidersHorizontal, Trash2, Edit2, FileText,
  Wallet, CreditCard, Plus, ArrowUpRight, ArrowDownRight, X,
  Banknote, ChevronDown, Tag, Calendar,
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

const CAT_EMOJI: Record<string, string> = {
  "Food & Dining":       "🍜",
  "Transportation":      "🚗",
  "Housing & Rent":      "🏠",
  "Utilities & Bills":   "⚡",
  "Entertainment":       "🎬",
  "Shopping":            "🛍️",
  "Health & Fitness":    "❤️",
  "Education":           "📚",
  "Travel":              "✈️",
  "Salary":              "💼",
  "Freelance & Business":"📈",
  "Investments":         "📊",
  "Gifts & Donations":   "🎁",
  "Other":               "📌",
};

function getPaymentIcon(method?: string) {
  if (!method) return <CreditCard className="w-3.5 h-3.5 text-slate-400" />;
  const m = method.toLowerCase();
  if (m.includes("cash")) return <Banknote className="w-3.5 h-3.5 text-emerald-400" />;
  if (m.includes("sewa") || m.includes("wallet") || m.includes("upi"))
    return <Wallet className="w-3.5 h-3.5 text-cyan-400" />;
  return <CreditCard className="w-3.5 h-3.5 text-slate-400" />;
}

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
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    setDeletingId(id);
    try { await onDelete(id); }
    finally { setDeletingId(null); }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const hasActiveFilters = category !== "All" || type !== "all" || sort !== "date-desc";

  return (
    <div className="space-y-4">

      {/* ── Search + Filter Bar ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, tags or notes…"
              className="w-full h-11 pl-10 pr-10 bg-white/[0.04] border border-white/[0.08] rounded-xl text-base text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter toggle button */}
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            title="Filters"
            className={`h-11 px-3.5 flex items-center gap-2 rounded-xl border transition relative ${
              hasActiveFilters || showFilters
                ? "bg-blue-600/20 border-blue-500/60 text-blue-400"
                : "bg-white/[0.04] border-white/[0.08] text-slate-300 hover:text-white hover:border-white/[0.14]"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm font-semibold hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
            )}
          </button>

          {/* Add button */}
          <button
            type="button"
            onClick={onAddNew}
            className="h-11 flex items-center gap-2 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/25 transition active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="font-semibold">Add</span>
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="animate-fade-up p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl space-y-3 shadow-xl">
            {/* Type filter */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
                Transaction Type
              </label>
              <div className="flex gap-2">
                {(["all", "expense", "income"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 h-9 rounded-xl text-sm font-medium transition ${
                      type === t
                        ? t === "expense"
                          ? "bg-rose-600/25 text-rose-300 border border-rose-500/50"
                          : t === "income"
                          ? "bg-emerald-600/25 text-emerald-300 border border-emerald-500/50"
                          : "bg-white/[0.12] text-white border border-white/[0.20]"
                        : "bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:text-white"
                    }`}
                  >
                    {t === "all" ? "All Types" : t === "expense" ? "Expenses Only" : "Income Only"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 cursor-pointer"
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
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
                  Sort Order
                </label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 cursor-pointer"
                >
                  <option value="date-desc" className="bg-[#111827]">Newest first</option>
                  <option value="date-asc"  className="bg-[#111827]">Oldest first</option>
                  <option value="amount-desc" className="bg-[#111827]">Highest amount</option>
                  <option value="amount-asc"  className="bg-[#111827]">Lowest amount</option>
                </select>
              </div>
            </div>

            {/* Reset */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => { setCategory("All"); setType("all"); setSort("date-desc"); }}
                className="w-full h-9 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white border border-white/[0.08] rounded-xl hover:bg-white/[0.04] transition"
              >
                Reset All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Transaction Count ── */}
      {!isLoading && filtered.length > 0 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Showing <span className="text-white font-semibold">{filtered.length}</span> of {expenses.length} transaction{expenses.length !== 1 ? "s" : ""}
          </p>
          <span className="text-xs text-slate-500">Tap card to view details</span>
        </div>
      )}

      {/* ── Transaction List ── */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/[0.03] border border-white/[0.05] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-3">
            <Search className="w-6 h-6 text-slate-500" />
          </div>
          <h4 className="text-base font-semibold text-slate-200 mb-1">
            {expenses.length === 0 ? "No transactions recorded" : "No matching transactions"}
          </h4>
          <p className="text-sm text-slate-400 max-w-xs mb-4">
            {expenses.length === 0
              ? "Tap the Add button above to record your first income or expense."
              : "Try adjusting your search keywords or filter options."}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => { setCategory("All"); setType("all"); setSearch(""); setSort("date-desc"); }}
              className="px-4 py-2 text-sm font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-xl transition"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((tx) => {
            const isIncome = tx.type === "income";
            const emoji = CAT_EMOJI[tx.category] ?? "📌";
            const isExpanded = expandedId === tx._id;
            const dateStr = new Date(tx.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const payDisplay =
              tx.paymentMethod === "Online / UPI" ? "e-Sewa / Wallet" : (tx.paymentMethod || "Other");

            return (
              <div
                key={tx._id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? "bg-white/[0.05] border-white/[0.14] shadow-xl"
                    : "bg-white/[0.03] hover:bg-white/[0.05] border-white/[0.07] hover:border-white/[0.12] shadow-sm"
                }`}
              >
                {/* ── Top Level: Avatar + Title & Category + Amount ── */}
                <div
                  onClick={() => tx._id && toggleExpand(tx._id)}
                  className="p-4 sm:p-4.5 cursor-pointer select-none space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Avatar + Title & Category */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {/* Category Emoji Badge */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                          isIncome
                            ? "bg-emerald-500/15 border border-emerald-500/25"
                            : "bg-rose-500/15 border border-rose-500/25"
                        }`}>
                          {emoji}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shadow-md ${
                          isIncome ? "bg-emerald-500 text-slate-950" : "bg-rose-500 text-white"
                        }`}>
                          {isIncome ? "+" : "−"}
                        </div>
                      </div>

                      {/* Title & Category */}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-base sm:text-lg font-bold text-white truncate leading-snug">
                          {tx.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.08] font-medium">
                            {tx.category}
                          </span>
                          {tx.linkedNoteId && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const id = typeof tx.linkedNoteId === "object"
                                  ? (tx.linkedNoteId as { _id: string })._id
                                  : tx.linkedNoteId as string;
                                onViewNote?.(id);
                              }}
                              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-indigo-950/70 text-indigo-300 border border-indigo-700/50 hover:bg-indigo-900/60 transition"
                            >
                              <FileText className="w-3 h-3 text-indigo-400" />
                              <span>Note</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Type badge */}
                    <div className="text-right flex-shrink-0">
                      <div className={`text-lg sm:text-xl font-extrabold font-mono leading-tight ${
                        isIncome ? "text-emerald-400" : "text-rose-400"
                      }`}>
                        {formatAmount(tx.amount, { showSign: true, isExpense: !isIncome })}
                      </div>
                      <span className={`inline-block mt-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        isIncome
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        {isIncome ? "Income" : "Expense"}
                      </span>
                    </div>
                  </div>

                  {/* ── Level 2: Dedicated Metadata Strip (Date, Wallet, Actions) ── */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-white/[0.05]">
                    {/* Metadata Badges: Date & Wallet */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {/* Date Badge */}
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-slate-300 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        <span>{dateStr}</span>
                      </span>

                      {/* Wallet / Payment Method Badge */}
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-slate-300 font-medium">
                        {getPaymentIcon(tx.paymentMethod)}
                        <span className="text-slate-200 font-semibold">{payDisplay}</span>
                      </span>
                    </div>

                    {/* Actions: Edit & Delete buttons */}
                    <div className="flex items-center gap-1.5 ml-auto" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onEdit(tx)}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold text-slate-200 bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] transition active:scale-95"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => tx._id && handleDelete(tx._id)}
                        disabled={deletingId === tx._id}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/40 transition active:scale-95 disabled:opacity-40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>

                      {/* Expand indicator button if notes/tags exist */}
                      {(tx.notes || (tx.tags && tx.tags.length > 0)) && (
                        <button
                          type="button"
                          onClick={() => tx._id && toggleExpand(tx._id)}
                          className={`h-8 w-8 rounded-xl flex items-center justify-center border transition ${
                            isExpanded
                              ? "bg-blue-600/20 text-blue-400 border-blue-500/40"
                              : "bg-white/[0.04] text-slate-400 border-white/[0.07] hover:text-white"
                          }`}
                          title="Toggle notes & tags"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Level 3: Expanded Notes & Tags Sub-Panel ── */}
                {isExpanded && (tx.notes || (tx.tags && tx.tags.length > 0)) && (
                  <div className="animate-fade-up px-4 sm:px-4.5 pb-4 pt-1 border-t border-white/[0.06] bg-black/25 space-y-2.5">
                    {tx.notes && (
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Notes
                        </span>
                        <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                          {tx.notes}
                        </p>
                      </div>
                    )}

                    {tx.tags && tx.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        {tx.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.05] text-slate-300 border border-white/[0.08]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

