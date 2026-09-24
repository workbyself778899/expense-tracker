"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { IDashboardStats } from "@/types";
import { useCurrency } from "@/context/CurrencyContext";

interface QuickStatsProps {
  stats: IDashboardStats | null;
  isLoading?: boolean;
}

export default function QuickStats({ stats, isLoading = false }: QuickStatsProps) {
  const { formatAmount } = useCurrency();
  const [expanded, setExpanded] = useState(false);

  if (isLoading || !stats) {
    return (
      <div className="space-y-2">
        {/* Hero skeleton */}
        <div className="h-28 rounded-2xl bg-white/[0.03] border border-white/[0.05] animate-pulse" />
        {/* Sub-cards skeleton */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/[0.03] border border-white/[0.05] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const isPositive  = stats.netBalance >= 0;
  const savingsWidth = `${Math.min(100, Math.max(0, stats.savingsRate))}%`;

  return (
    <div className="space-y-2">

      {/* ── Hero: Net Balance (Full width, always visible, clickable) ── */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden group ${
          isPositive
            ? "bg-gradient-to-br from-blue-600/10 to-indigo-600/5 border-blue-500/20 hover:border-blue-500/40"
            : "bg-gradient-to-br from-rose-600/10 to-rose-800/5 border-rose-500/20 hover:border-rose-500/40"
        }`}
      >
        {/* Decorative glow */}
        <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-10 blur-2xl pointer-events-none ${isPositive ? "bg-blue-500" : "bg-rose-500"}`} />

        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[11px] font-semibold uppercase tracking-widest ${isPositive ? "text-blue-400" : "text-rose-400"}`}>
                Net Balance
              </span>
              <span className="text-[10px] text-slate-500">
                · {stats.transactionCount} transactions
              </span>
            </div>
            <div className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-mono leading-none ${isPositive ? "text-white" : "text-rose-400"}`}>
              {formatAmount(stats.netBalance)}
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              {isPositive ? "You're in the green 🎉" : "Expenses exceed income"}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
              isPositive ? "bg-blue-500/15 text-blue-400 border-blue-500/25" : "bg-rose-500/15 text-rose-400 border-rose-500/25"
            }`}>
              <Wallet className="w-5 h-5" />
            </div>
            <div className={`flex items-center gap-1 text-[11px] font-medium ${isPositive ? "text-blue-400" : "text-rose-400"}`}>
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{expanded ? "Less" : "More"}</span>
            </div>
          </div>
        </div>

        {/* Mini summary row — always visible below balance */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-mono font-semibold text-emerald-400">{formatAmount(stats.totalIncome)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-xs font-mono font-semibold text-rose-400">{formatAmount(stats.totalExpense)}</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <PiggyBank className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-mono font-semibold text-indigo-400">{stats.savingsRate}%</span>
          </div>
        </div>
      </button>

      {/* ── Expanded: Sub-Cards ── */}
      {expanded && (
        <div className="grid grid-cols-3 gap-2 animate-fade-up">
          {/* Income */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.03] border border-emerald-500/15 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Income</span>
              <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-3 h-3" />
              </span>
            </div>
            <div className="text-base sm:text-xl font-extrabold font-mono leading-none text-emerald-400 truncate">
              {formatAmount(stats.totalIncome)}
            </div>
            <p className="text-[10px] text-slate-500 mt-1 truncate">Inflows</p>
          </div>

          {/* Expenses */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.03] border border-rose-500/15 hover:border-rose-500/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Spent</span>
              <span className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
                <TrendingDown className="w-3 h-3" />
              </span>
            </div>
            <div className="text-base sm:text-xl font-extrabold font-mono leading-none text-rose-400 truncate">
              {formatAmount(stats.totalExpense)}
            </div>
            <p className="text-[10px] text-slate-500 mt-1 truncate">~{formatAmount(stats.avgDailyExpense)}/day</p>
          </div>

          {/* Savings Rate */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.03] border border-indigo-500/15 hover:border-indigo-500/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Saved</span>
              <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                <PiggyBank className="w-3 h-3" />
              </span>
            </div>
            <div className="text-base sm:text-xl font-extrabold font-mono leading-none text-indigo-400">
              {stats.savingsRate}%
            </div>
            <div className="w-full bg-white/[0.06] rounded-full h-1 mt-2 overflow-hidden">
              <div
                className="h-1 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-700"
                style={{ width: savingsWidth }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
