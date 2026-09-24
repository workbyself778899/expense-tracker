"use client";

import React, { useState } from "react";
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";
import { IDashboardStats } from "@/types";
import { useCurrency } from "@/context/CurrencyContext";

interface QuickStatsProps {
  stats: IDashboardStats | null;
  isLoading?: boolean;
}

type StatId = "balance" | "income" | "expense" | "savings";

interface StatCard {
  id: StatId;
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  heroColor: string;        // gradient classes for hero
  heroBorder: string;       // border color for hero
  heroGlow: string;         // glow blob color
  heroText: string;         // value text color
  heroAccent: string;       // accent text (label)
  iconBg: string;           // icon badge bg/text/border
  cardBorder: string;       // mini-card border
  cardValueColor: string;   // mini-card value text
}

export default function QuickStats({ stats, isLoading = false }: QuickStatsProps) {
  const { formatAmount } = useCurrency();
  const [heroId, setHeroId] = useState<StatId>("balance");

  if (isLoading || !stats) {
    return (
      <div className="space-y-2">
        <div className="h-28 rounded-2xl bg-white/[0.03] border border-white/[0.05] animate-pulse" />
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/[0.03] border border-white/[0.05] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const isPositive   = stats.netBalance >= 0;
  const savingsWidth = `${Math.min(100, Math.max(0, stats.savingsRate))}%`;

  const CARDS: StatCard[] = [
    {
      id:             "balance",
      label:          "Net Balance",
      value:          formatAmount(stats.netBalance),
      sub:            `${stats.transactionCount} transactions · ${isPositive ? "In the green 🎉" : "Expenses exceed income"}`,
      icon:           Wallet,
      heroColor:      isPositive ? "from-blue-600/10 to-indigo-600/5" : "from-rose-600/10 to-rose-800/5",
      heroBorder:     isPositive ? "border-blue-500/25 hover:border-blue-500/45" : "border-rose-500/25 hover:border-rose-500/45",
      heroGlow:       isPositive ? "bg-blue-500"  : "bg-rose-500",
      heroText:       isPositive ? "text-white"   : "text-rose-400",
      heroAccent:     isPositive ? "text-blue-400" : "text-rose-400",
      iconBg:         isPositive ? "bg-blue-500/15 text-blue-400 border-blue-500/25" : "bg-rose-500/15 text-rose-400 border-rose-500/25",
      cardBorder:     isPositive ? "border-blue-500/15 hover:border-blue-500/35"     : "border-rose-500/15 hover:border-rose-500/35",
      cardValueColor: isPositive ? "text-blue-300"  : "text-rose-400",
    },
    {
      id:             "income",
      label:          "Total Income",
      value:          formatAmount(stats.totalIncome),
      sub:            "Cash inflows & earnings",
      icon:           TrendingUp,
      heroColor:      "from-emerald-600/10 to-emerald-800/5",
      heroBorder:     "border-emerald-500/25 hover:border-emerald-500/45",
      heroGlow:       "bg-emerald-500",
      heroText:       "text-emerald-400",
      heroAccent:     "text-emerald-400",
      iconBg:         "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
      cardBorder:     "border-emerald-500/15 hover:border-emerald-500/35",
      cardValueColor: "text-emerald-400",
    },
    {
      id:             "expense",
      label:          "Total Spent",
      value:          formatAmount(stats.totalExpense),
      sub:            `~${formatAmount(stats.avgDailyExpense)}/day avg`,
      icon:           TrendingDown,
      heroColor:      "from-rose-600/10 to-rose-900/5",
      heroBorder:     "border-rose-500/25 hover:border-rose-500/45",
      heroGlow:       "bg-rose-500",
      heroText:       "text-rose-400",
      heroAccent:     "text-rose-400",
      iconBg:         "bg-rose-500/15 text-rose-400 border-rose-500/25",
      cardBorder:     "border-rose-500/15 hover:border-rose-500/35",
      cardValueColor: "text-rose-400",
    },
    {
      id:             "savings",
      label:          "Savings Rate",
      value:          `${stats.savingsRate}%`,
      sub:            `Top: ${stats.topCategory?.category ?? "—"}`,
      icon:           PiggyBank,
      heroColor:      "from-indigo-600/10 to-indigo-900/5",
      heroBorder:     "border-indigo-500/25 hover:border-indigo-500/45",
      heroGlow:       "bg-indigo-500",
      heroText:       "text-indigo-400",
      heroAccent:     "text-indigo-400",
      iconBg:         "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
      cardBorder:     "border-indigo-500/15 hover:border-indigo-500/35",
      cardValueColor: "text-indigo-400",
    },
  ];

  const hero    = CARDS.find((c) => c.id === heroId)!;
  const subCards = CARDS.filter((c) => c.id !== heroId);

  return (
    <div className="space-y-2">

      {/* ── Hero Card (full-width) ── */}
      <div
        className={`relative w-full text-left p-4 sm:p-5 rounded-2xl border bg-gradient-to-br ${hero.heroColor} ${hero.heroBorder} overflow-hidden transition-all duration-300 shadow-xl`}
      >
        {/* Decorative glow */}
        <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-15 blur-2xl pointer-events-none ${hero.heroGlow}`} />

        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span className={`text-xs font-bold uppercase tracking-wider ${hero.heroAccent}`}>
              {hero.label}
            </span>
            <div className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-mono leading-none mt-1.5 ${hero.heroText}`}>
              {hero.value}
            </div>
            <p className="text-sm text-slate-300 font-medium mt-2 truncate">{hero.sub}</p>

            {/* Savings progress bar inside hero when savings is selected */}
            {hero.id === "savings" && (
              <div className="w-full bg-white/[0.08] rounded-full h-1.5 mt-3 overflow-hidden max-w-xs">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-700"
                  style={{ width: savingsWidth }}
                />
              </div>
            )}
          </div>

          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border flex-shrink-0 ${hero.iconBg}`}>
            <hero.icon className="w-6 h-6" />
          </div>
        </div>

        {/* Hint */}
        <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
          <span>👆</span> Tap any card below to promote it here
        </p>
      </div>

      {/* ── Sub-Cards Grid (the other 3, always visible, clickable) ── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {subCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setHeroId(card.id)}
              className={`text-left p-3 sm:p-4 rounded-2xl bg-white/[0.03] border ${card.cardBorder} transition-all duration-200 active:scale-[0.97] group`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider leading-tight">
                  {card.label.split(" ").pop()}
                </span>
                <span className={`w-7 h-7 rounded-xl flex items-center justify-center border flex-shrink-0 ${card.iconBg}`}>
                  <Icon className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className={`text-base sm:text-xl font-extrabold font-mono leading-none truncate ${card.cardValueColor}`}>
                {card.value}
              </div>
              {card.id === "savings" && (
                <div className="w-full bg-white/[0.08] rounded-full h-1 mt-2.5 overflow-hidden">
                  <div
                    className="h-1 rounded-full bg-indigo-500 transition-all duration-500"
                    style={{ width: savingsWidth }}
                  />
                </div>
              )}
              <p className="text-xs text-slate-400 mt-1.5 truncate">{card.sub}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
