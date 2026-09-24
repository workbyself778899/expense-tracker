"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
} from "lucide-react";
import { IDashboardStats } from "@/types";
import { useCurrency } from "@/context/CurrencyContext";

interface QuickStatsProps {
  stats: IDashboardStats | null;
  isLoading?: boolean;
}

const SKELETONS = [1, 2, 3, 4];

export default function QuickStats({ stats, isLoading = false }: QuickStatsProps) {
  const { formatAmount } = useCurrency();

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {SKELETONS.map((i) => (
          <div
            key={i}
            className="h-24 rounded-2xl bg-white/[0.03] border border-white/[0.05] animate-pulse"
          />
        ))}
      </div>
    );
  }

  const isPositive = stats.netBalance >= 0;
  const savingsWidth = `${Math.min(100, Math.max(0, stats.savingsRate))}%`;

  const cards = [
    {
      label: "Net Balance",
      value: formatAmount(stats.netBalance),
      sub: `${stats.transactionCount} transactions`,
      icon: Wallet,
      positive: isPositive,
      color: isPositive ? "blue" : "rose",
    },
    {
      label: "Total Income",
      value: formatAmount(stats.totalIncome),
      sub: "Cash inflows & earnings",
      icon: TrendingUp,
      positive: true,
      color: "emerald",
    },
    {
      label: "Total Expenses",
      value: formatAmount(stats.totalExpense),
      sub: `~${formatAmount(stats.avgDailyExpense)}/day avg`,
      icon: TrendingDown,
      positive: false,
      color: "rose",
    },
  ];

  const colorMap: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  };
  const valueColorMap: Record<string, string> = {
    blue: isPositive ? "text-white" : "text-rose-400",
    emerald: "text-emerald-400",
    rose: "text-rose-400",
    indigo: "text-indigo-400",
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(({ label, value, sub, icon: Icon, color }) => (
        <div
          key={label}
          className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.10] transition-all duration-200 group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{label}</span>
            <span className={`w-7 h-7 rounded-xl flex items-center justify-center border ${colorMap[color]}`}>
              <Icon className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className={`text-xl sm:text-2xl font-extrabold tracking-tight font-mono leading-none ${valueColorMap[color]}`}>
            {value}
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 truncate">{sub}</p>
        </div>
      ))}

      {/* Savings Rate Card */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.10] transition-all duration-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Savings</span>
          <span className={`w-7 h-7 rounded-xl flex items-center justify-center border ${colorMap["indigo"]}`}>
            <PiggyBank className="w-3.5 h-3.5" />
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-extrabold tracking-tight font-mono leading-none text-indigo-400">
          {stats.savingsRate}%
        </div>
        <div className="w-full bg-white/[0.06] rounded-full h-1 mt-2.5 overflow-hidden">
          <div
            className="h-1 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-700"
            style={{ width: savingsWidth }}
          />
        </div>
        <p className="text-[11px] text-slate-500 mt-1.5 truncate">
          Top: {stats.topCategory?.category ?? "—"}
        </p>
      </div>
    </div>
  );
}
