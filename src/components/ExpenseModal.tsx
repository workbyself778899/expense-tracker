"use client";

import React, { useState } from "react";
import {
  X,
  PlusCircle,
  Calendar,
  CreditCard,
  DollarSign,
  Tag,
  FileText,
  Utensils,
  Car,
  Home,
  Zap,
  Film,
  ShoppingBag,
  HeartPulse,
  GraduationCap,
  Plane,
  Briefcase,
  TrendingUp,
  Gift,
  HelpCircle,
} from "lucide-react";
import { IExpense, TransactionType, INote } from "@/types";

interface ExpenseModalProps {
  initialExpense?: Partial<IExpense> | null;
  notesList?: INote[];
  onSave: (expenseData: Partial<IExpense>) => Promise<void>;
  onCancel: () => void;
}

const CATEGORIES: { label: string; icon: React.ElementType; type: "both" | "expense" | "income" }[] = [
  { label: "Food & Dining", icon: Utensils, type: "expense" },
  { label: "Transportation", icon: Car, type: "expense" },
  { label: "Housing & Rent", icon: Home, type: "expense" },
  { label: "Utilities & Bills", icon: Zap, type: "expense" },
  { label: "Entertainment", icon: Film, type: "expense" },
  { label: "Shopping", icon: ShoppingBag, type: "expense" },
  { label: "Health & Fitness", icon: HeartPulse, type: "expense" },
  { label: "Education", icon: GraduationCap, type: "expense" },
  { label: "Travel", icon: Plane, type: "expense" },
  { label: "Salary", icon: Briefcase, type: "income" },
  { label: "Freelance & Business", icon: TrendingUp, type: "income" },
  { label: "Investments", icon: TrendingUp, type: "both" },
  { label: "Gifts & Donations", icon: Gift, type: "both" },
  { label: "Other", icon: HelpCircle, type: "both" },
];

const PAYMENT_METHODS = [
  "Cash",
  "Credit Card",
  "Debit Card",
  "Online / UPI",
  "Bank Transfer",
  "Crypto / Other",
];

export default function ExpenseModal({
  initialExpense,
  notesList = [],
  onSave,
  onCancel,
}: ExpenseModalProps) {
  const [type, setType] = useState<TransactionType>(initialExpense?.type || "expense");
  const [title, setTitle] = useState(initialExpense?.title || "");
  const [amount, setAmount] = useState<string>(
    initialExpense?.amount !== undefined ? String(initialExpense.amount) : ""
  );
  const [category, setCategory] = useState(
    initialExpense?.category || (type === "income" ? "Salary" : "Food & Dining")
  );
  const [date, setDate] = useState(
    initialExpense?.date
      ? new Date(initialExpense.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = useState(
    initialExpense?.paymentMethod || "Credit Card"
  );
  const [notes, setNotes] = useState(initialExpense?.notes || "");
  const [tagsInput, setTagsInput] = useState(
    initialExpense?.tags ? initialExpense.tags.join(", ") : ""
  );
  const [linkedNoteId, setLinkedNoteId] = useState(
    initialExpense?.linkedNoteId || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter categories based on transaction type
  const availableCategories = CATEGORIES.filter(
    (c) => c.type === "both" || c.type === type
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      alert("Please enter a valid positive amount");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    setIsSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        amount: numAmount,
        type,
        category,
        date: new Date(date).toISOString(),
        paymentMethod,
        notes: notes.trim(),
        tags,
        linkedNoteId: linkedNoteId ? linkedNoteId : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span
              className={`p-2 rounded-lg border ${
                type === "expense"
                  ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                  : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              }`}
            >
              <DollarSign className="w-4 h-4" />
            </span>
            <h2 className="text-base font-semibold text-slate-100">
              {initialExpense?._id
                ? "Edit Transaction"
                : type === "expense"
                ? "Add New Expense"
                : "Add New Income"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto p-5 space-y-4">
          {/* Expense vs Income Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setType("expense");
                if (category === "Salary" || category === "Freelance & Business") {
                  setCategory("Food & Dining");
                }
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                type === "expense"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-900/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              💸 Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType("income");
                setCategory("Salary");
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                type === "income"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              💰 Income
            </button>
          </div>

          {/* Title & Amount */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Transaction Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Grocery shopping, Rent payment, Freelance gig"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Amount ($) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-lg font-bold text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>
            </div>
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
              {availableCategories.map((c) => {
                const Icon = c.icon;
                const isSelected = category === c.label;
                return (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => setCategory(c.label)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs font-medium transition ${
                      isSelected
                        ? "bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition cursor-pointer"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm} className="bg-slate-900">
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Linked Note (Connects Note category to expense!) */}
          {notesList.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Attach / Link to Note (Optional)
              </label>
              <select
                value={linkedNoteId}
                onChange={(e) => setLinkedNoteId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
              >
                <option value="">No linked note</option>
                {notesList.map((n) => (
                  <option key={n._id} value={n._id} className="bg-slate-900">
                    [{n.category}] {n.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tags & Note remarks */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. food, delivery, work, tax-deductible"
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Quick Remarks / Receipt Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add brief memo or details..."
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-lg transition disabled:opacity-50 ${
                type === "expense"
                  ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/25"
                  : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25"
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              {isSubmitting
                ? "Saving..."
                : initialExpense?._id
                ? "Update Transaction"
                : type === "expense"
                ? "Add Expense"
                : "Add Income"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
