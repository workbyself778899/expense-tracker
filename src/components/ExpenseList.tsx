"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  FileText,
  Calendar,
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { IExpense, ExpenseCategory, TransactionType } from "@/types";

interface ExpenseListProps {
  expenses: IExpense[];
  isLoading?: boolean;
  onEdit: (expense: IExpense) => void;
  onDelete: (id: string) => Promise<void>;
  onAddNew: () => void;
  onViewNote?: (noteId: string) => void;
}

const CATEGORIES: (ExpenseCategory | "All")[] = [
  "All",
  "Food & Dining",
  "Transportation",
  "Housing & Rent",
  "Utilities & Bills",
  "Entertainment",
  "Shopping",
  "Health & Fitness",
  "Education",
  "Salary",
  "Freelance & Business",
  "Investments",
  "Other",
];

export default function ExpenseList({
  expenses,
  isLoading = false,
  onEdit,
  onDelete,
  onAddNew,
  onViewNote,
}: ExpenseListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<TransactionType | "all">("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc">("date-desc");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtered & sorted list
  const filtered = expenses
    .filter((tx) => {
      const matchesSearch =
        searchTerm === "" ||
        tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.notes && tx.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.tags && tx.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchesCat =
        selectedCategory === "All" || tx.category === selectedCategory;

      const matchesType =
        selectedType === "all" || tx.type === selectedType;

      return matchesSearch && matchesCat && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === "date-desc") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === "date-asc") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === "amount-desc") {
        return b.amount - a.amount;
      }
      if (sortBy === "amount-asc") {
        return a.amount - b.amount;
      }
      return 0;
    });

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      setDeletingId(id);
      try {
        await onDelete(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800/80 shadow-md">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search transactions, notes, or tags..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type filter */}
          <div className="flex items-center bg-slate-950/80 p-0.5 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setSelectedType("all")}
              className={`px-2.5 py-1.5 rounded-lg transition ${
                selectedType === "all"
                  ? "bg-slate-800 text-white font-medium shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("expense")}
              className={`px-2.5 py-1.5 rounded-lg transition ${
                selectedType === "expense"
                  ? "bg-rose-600/30 text-rose-300 font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Expenses
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("income")}
              className={`px-2.5 py-1.5 rounded-lg transition ${
                selectedType === "income"
                  ? "bg-emerald-600/30 text-emerald-300 font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Income
            </button>
          </div>

          {/* Category dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-slate-900">
                  {c === "All" ? "All Categories" : c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort dropdown */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-slate-950/80 border border-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>

          {/* New Transaction button */}
          <button
            type="button"
            onClick={onAddNew}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/25 transition ml-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Transactions List */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center p-12 bg-slate-900/40 rounded-2xl border border-slate-800/80">
          <Filter className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-300">
            No transactions match your criteria
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query, type or category filters, or record a new entry.
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

            return (
              <div
                key={tx._id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800/80 hover:border-slate-700/80 transition shadow-sm gap-3"
              >
                {/* Left info: Icon, Title, Category, Date */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                      isIncome
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}
                  >
                    {isIncome ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-slate-100 truncate">
                        {tx.title}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                        {tx.category}
                      </span>

                      {/* Linked Note Indicator */}
                      {tx.linkedNoteId && (
                        <button
                          type="button"
                          onClick={() => {
                            if (typeof tx.linkedNoteId === "object" && tx.linkedNoteId !== null) {
                              onViewNote?.((tx.linkedNoteId as { _id: string })._id);
                            } else if (typeof tx.linkedNoteId === "string") {
                              onViewNote?.(tx.linkedNoteId);
                            }
                          }}
                          className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-700/50 hover:bg-indigo-900/60 transition"
                          title="Click to view linked note"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Linked Note</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {dateStr}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-slate-500" />
                        {tx.paymentMethod}
                      </span>
                      {tx.notes && (
                        <span className="text-slate-500 truncate max-w-xs italic">
                          &quot;{tx.notes}&quot;
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right info: Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                  <div className="text-right">
                    <span
                      className={`text-base sm:text-lg font-bold font-mono ${
                        isIncome ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isIncome ? "+" : "-"}$
                      {Number(tx.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={() => onEdit(tx)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                      title="Edit transaction"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => tx._id && handleDelete(tx._id)}
                      disabled={deletingId === tx._id}
                      className="p-1.5 rounded-lg bg-rose-950/60 text-rose-300 hover:bg-rose-900 border border-rose-800/40 transition disabled:opacity-40"
                      title="Delete transaction"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
