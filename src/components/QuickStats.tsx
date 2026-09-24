"use client";

import React from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  Sparkles,
} from "lucide-react";
import { IDashboardStats } from "@/types";

interface QuickStatsProps {
  stats: IDashboardStats | null;
  isLoading?: boolean;
}

export default function QuickStats({ stats, isLoading = false }: QuickStatsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-slate-900/60 border border-slate-800 p-4 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const isPositiveBalance = stats.netBalance >= 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Net Balance */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/90 shadow-xl relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Total Net Balance</span>
          <span
            className={`p-2 rounded-xl ${
              isPositiveBalance
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}
          >
            <Wallet className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-3">
          <div
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isPositiveBalance ? "text-slate-100" : "text-rose-400"
            }`}
          >
            ${stats.netBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>{stats.transactionCount} transactions recorded</span>
          </p>
        </div>
      </div>

      {/* 2. Total Incomes */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/90 shadow-xl relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Total Income</span>
          <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-400">
            +${stats.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Cash inflow & earnings
          </p>
        </div>
      </div>

      {/* 3. Total Expenses */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/90 shadow-xl relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Total Expenses</span>
          <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ArrowDownRight className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-rose-400">
            -${stats.totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Avg ~${stats.avgDailyExpense.toFixed(2)}/day
          </p>
        </div>
      </div>

      {/* 4. Savings Rate & Top Category */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/90 shadow-xl relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Savings Rate</span>
          <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <PiggyBank className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-indigo-400">
            {stats.savingsRate}%
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, stats.savingsRate))}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 truncate flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400 inline" />
            <span>Top: {stats.topCategory ? stats.topCategory.category : "N/A"}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
