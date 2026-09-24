"use client";

import React, { useState } from "react";
import {
  X,
  DollarSign,
  Utensils, Car, Home, Zap, Film, ShoppingBag,
  HeartPulse, GraduationCap, Plane, Briefcase,
  TrendingUp, Gift, HelpCircle, PlusCircle,
} from "lucide-react";
import { IExpense, TransactionType, INote } from "@/types";
import { useCurrency } from "@/context/CurrencyContext";

interface ExpenseModalProps {
  initialExpense?: Partial<IExpense> | null;
  notesList?: INote[];
  onSave: (data: Partial<IExpense>) => Promise<void>;
  onCancel: () => void;
}

const CATEGORIES = [
  { label: "Food & Dining",        icon: Utensils,      type: "expense" },
  { label: "Transportation",       icon: Car,           type: "expense" },
  { label: "Housing & Rent",       icon: Home,          type: "expense" },
  { label: "Utilities & Bills",    icon: Zap,           type: "expense" },
  { label: "Entertainment",        icon: Film,          type: "expense" },
  { label: "Shopping",             icon: ShoppingBag,   type: "expense" },
  { label: "Health & Fitness",     icon: HeartPulse,    type: "expense" },
  { label: "Education",            icon: GraduationCap, type: "expense" },
  { label: "Travel",               icon: Plane,         type: "expense" },
  { label: "Salary",               icon: Briefcase,     type: "income"  },
  { label: "Freelance & Business", icon: TrendingUp,    type: "income"  },
  { label: "Investments",          icon: TrendingUp,    type: "both"    },
  { label: "Gifts & Donations",    icon: Gift,          type: "both"    },
  { label: "Other",                icon: HelpCircle,    type: "both"    },
] as const;

const PAYMENT_METHODS = [
  "Cash",
  "e-Sewa / Wallet",
  "Debit Card",
  "Credit Card",
  "Bank Transfer",
  "Crypto / Other",
];

export default function ExpenseModal({
  initialExpense,
  notesList = [],
  onSave,
  onCancel,
}: ExpenseModalProps) {
  const { currency } = useCurrency();
  const isEdit = !!initialExpense?._id;

  const [type, setType] = useState<TransactionType>(initialExpense?.type ?? "expense");
  const [title, setTitle] = useState(initialExpense?.title ?? "");
  const [amount, setAmount] = useState(
    initialExpense?.amount !== undefined ? String(initialExpense.amount) : ""
  );
  const [category, setCategory] = useState(
    initialExpense?.category ?? (initialExpense?.type === "income" ? "Salary" : "Food & Dining")
  );
  const [date, setDate] = useState(
    initialExpense?.date
      ? new Date(initialExpense.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = useState(
    initialExpense?.paymentMethod === "Online / UPI"
      ? "e-Sewa / Wallet"
      : (initialExpense?.paymentMethod ?? "Cash")
  );
  const [notes, setNotes] = useState(initialExpense?.notes ?? "");
  const [tags, setTags] = useState(initialExpense?.tags?.join(", ") ?? "");
  const [linkedNoteId, setLinkedNoteId] = useState(initialExpense?.linkedNoteId ?? "");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; amount?: string }>({});

  const isExpense = type === "expense";
  const availableCategories = CATEGORIES.filter(
    (c) => c.type === "both" || c.type === type
  );

  const validate = () => {
    const e: typeof errors = {};
    if (!title.trim()) e.title = "Title is required";
    const n = parseFloat(amount);
    if (!amount || isNaN(n) || n <= 0) e.amount = "Enter a valid amount";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        amount: parseFloat(amount),
        type,
        category,
        date: new Date(date).toISOString(),
        paymentMethod,
        notes: notes.trim() || undefined,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        linkedNoteId: linkedNoteId || undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      {/* Sheet — slides up on mobile, centered modal on desktop */}
      <div className="animate-slide-up w-full sm:max-w-lg sm:mx-4 rounded-t-3xl sm:rounded-3xl bg-[#0f1623] border border-white/[0.08] shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh]">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isExpense ? "bg-rose-500/15 text-rose-400" : "bg-emerald-500/15 text-emerald-400"
            }`}>
              <DollarSign className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white">
              {isEdit ? "Edit Transaction" : isExpense ? "New Expense" : "New Income"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
          <div className="px-5 pt-4 pb-2 space-y-4">

            {/* Type toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-white/[0.04] rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setType("expense");
                  if (category === "Salary" || category === "Freelance & Business") setCategory("Food & Dining");
                }}
                className={`h-10 rounded-xl text-sm font-semibold transition-all ${
                  isExpense
                    ? "bg-rose-600 text-white shadow-md shadow-rose-900/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => { setType("income"); setCategory("Salary"); }}
                className={`h-10 rounded-xl text-sm font-semibold transition-all ${
                  !isExpense
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Income
              </button>
            </div>

            {/* Title */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors((p) => ({ ...p, title: undefined })); }}
                placeholder="What did you spend on?"
                className={`w-full h-12 px-4 bg-white/[0.04] border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition ${
                  errors.title ? "border-rose-500 focus:border-rose-400" : "border-white/[0.08] focus:border-blue-500/60"
                }`}
              />
              {errors.title && <p className="text-xs text-rose-400 mt-1">{errors.title}</p>}
            </div>

            {/* Amount */}
            <div>
              <div className={`flex items-center h-14 bg-white/[0.04] border rounded-xl overflow-hidden transition ${
                errors.amount ? "border-rose-500" : "border-white/[0.08] focus-within:border-blue-500/60"
              }`}>
                <span className="px-3 text-sm font-mono font-semibold text-slate-400 border-r border-white/[0.08] h-full flex items-center min-w-[3rem] justify-center shrink-0">
                  {currency.length <= 3 ? currency : currency.slice(0, 3)}
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); if (errors.amount) setErrors((p) => ({ ...p, amount: undefined })); }}
                  placeholder="0.00"
                  className="flex-1 h-full px-3 bg-transparent text-xl font-bold text-white placeholder-slate-600 focus:outline-none"
                />
              </div>
              {errors.amount && <p className="text-xs text-rose-400 mt-1">{errors.amount}</p>}
            </div>

            {/* Category grid */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Category</label>
              <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto">
                {availableCategories.map((c) => {
                  const Icon = c.icon;
                  const isSelected = category === c.label;
                  return (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => setCategory(c.label)}
                      className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-center transition-all text-[11px] font-medium ${
                        isSelected
                          ? "bg-blue-600/20 border-blue-500/60 text-blue-300"
                          : "bg-white/[0.03] border-white/[0.06] text-slate-400 hover:border-white/[0.12] hover:text-white active:scale-95"
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="leading-tight text-center line-clamp-2">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date + Payment row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Payment</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/60 transition cursor-pointer"
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm} value={pm} className="bg-[#111827]">{pm}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes + Tags (collapsed to save mobile space) */}
            <div className="space-y-3">
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Quick note (optional)"
                className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition"
              />
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Tags: food, work, tax… (comma separated)"
                className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition"
              />
            </div>

            {/* Linked note */}
            {notesList.length > 0 && (
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Link to Note</label>
                <select
                  value={linkedNoteId}
                  onChange={(e) => setLinkedNoteId(e.target.value)}
                  className="w-full h-10 px-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500/60 transition cursor-pointer"
                >
                  <option value="" className="bg-[#111827]">No linked note</option>
                  {notesList.map((n) => (
                    <option key={n._id} value={n._id} className="bg-[#111827]">
                      {n.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="px-5 pt-3 pb-5 mt-auto flex items-center gap-3 border-t border-white/[0.06] flex-shrink-0">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="h-11 flex-1 rounded-xl text-sm font-semibold text-slate-400 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`h-11 flex-1 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 ${
                isExpense
                  ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/25"
                  : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              {saving ? "Saving…" : isEdit ? "Update" : isExpense ? "Add Expense" : "Add Income"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
