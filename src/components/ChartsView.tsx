"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  CreditCard,
  Calendar,
} from "lucide-react";
import { IDashboardStats } from "@/types";
import { useCurrency } from "@/context/CurrencyContext";

interface ChartsViewProps {
  stats: IDashboardStats | null;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  isLoading?: boolean;
}

const TIME_RANGES = [
  { label: "7 Days",  value: "7d"   },
  { label: "30 Days", value: "30d"  },
  { label: "90 Days", value: "90d"  },
  { label: "This Year", value: "year" },
  { label: "All Time", value: "all"  },
];

const CHART_TABS = [
  { id: "all",      label: "All"      },
  { id: "trend",    label: "Trend",   Icon: TrendingUp  },
  { id: "category", label: "Category",Icon: PieIcon     },
  { id: "cashflow", label: "Monthly", Icon: BarChart3   },
  { id: "payment",  label: "Payments",Icon: CreditCard  },
] as const;

type ActiveTab = (typeof CHART_TABS)[number]["id"];

// Shared Recharts tooltip style
const TOOLTIP_STYLE = {
  backgroundColor: "#0d1424",
  borderColor: "#1e293b",
  borderRadius: "10px",
  fontSize: "12px",
  color: "#f1f5f9",
};

// Prevent bar/slice from changing background on click — just use cursor:default
const NO_CLICK_STYLE = { cursor: "default", outline: "none" };

export default function ChartsView({
  stats,
  timeRange,
  onTimeRangeChange,
  isLoading = false,
}: ChartsViewProps) {
  const { formatAmount } = useCurrency();
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");

  const formatVal = (v: number | string | undefined) => formatAmount(v);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-10 rounded-2xl bg-white/[0.03] border border-white/[0.05] animate-pulse" />
        <div className="h-64 rounded-2xl bg-white/[0.03] border border-white/[0.05] animate-pulse" />
      </div>
    );
  }

  const categoryData = stats?.categoryBreakdown || [];
  const dailyData    = stats?.dailyTrends       || [];
  const monthlyData  = stats?.monthlyTrends     || [];
  const paymentData  = stats?.paymentMethodBreakdown || [];
  const hasData      = (stats?.totalExpense || 0) > 0 || (stats?.totalIncome || 0) > 0;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
          <PieIcon className="w-6 h-6 text-slate-600" />
        </div>
        <h3 className="text-sm font-semibold text-slate-300">No chart data yet</h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Add your first transaction to unlock analytics charts.
        </p>
      </div>
    );
  }

  const isFullWidth = activeTab !== "all";

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        {/* Chart tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {CHART_TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                activeTab === id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Time range */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto sm:ml-auto">
          <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value)}
            className="h-8 bg-white/[0.04] border border-white/[0.08] text-slate-200 text-xs rounded-xl px-2.5 focus:outline-none focus:border-blue-500/60 cursor-pointer"
          >
            {TIME_RANGES.map((tr) => (
              <option key={tr.value} value={tr.value} className="bg-[#111827]">
                {tr.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Charts grid */}
      <div className={`grid grid-cols-1 gap-4 ${isFullWidth ? "" : "lg:grid-cols-2"}`}>

        {/* ── CHART 1: Spending Trend ── */}
        {(activeTab === "all" || activeTab === "trend") && (
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  Expense &amp; Income Timeline
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Daily cash flow</p>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-400 border border-white/[0.07]">
                {dailyData.length}d
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData} margin={{ top: 6, right: 8, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}  />
                    </linearGradient>
                    <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}  />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2540" />
                  <XAxis
                    dataKey="date"
                    stroke="#475569"
                    fontSize={10}
                    tickFormatter={(str) => {
                      const d = new Date(str);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                  />
                  <YAxis stroke="#475569" fontSize={10} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [formatVal(Number(v)), ""]} />
                  <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#expGrad)" name="Expense" />
                  <Area type="monotone" dataKey="income"  stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#incGrad)"  name="Income"  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── CHART 2: Category Breakdown ── */}
        {(activeTab === "all" || activeTab === "category") && (
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  Category Breakdown
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Expense distribution</p>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-400 border border-white/[0.07]">
                {categoryData.length} cats
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-3 flex-1">
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={76}
                      paddingAngle={4}
                      style={NO_CLICK_STYLE}
                    >
                      {categoryData.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={entry.color || "#6366f1"} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [formatVal(Number(v)), "Spent"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 max-h-52 overflow-y-auto">
                {categoryData.map((cat) => (
                  <div
                    key={cat.category}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color || "#6366f1" }}
                      />
                      <span className="text-slate-300 font-medium truncate">{cat.category}</span>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                      <span className="font-mono text-slate-200 text-[11px]">{formatAmount(cat.amount)}</span>
                      <span className="text-[10px] text-slate-500">({cat.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CHART 3: Monthly Income vs Expenses ── */}
        {(activeTab === "all" || activeTab === "cashflow") && (
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex flex-col">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                Monthly Income vs Expenses
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Monthly cash flow comparison</p>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={
                    monthlyData.length > 0
                      ? monthlyData
                      : [{ month: "Current", income: stats?.totalIncome || 0, expense: stats?.totalExpense || 0 }]
                  }
                  margin={{ top: 6, right: 8, left: -24, bottom: 0 }}
                  barCategoryGap="30%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2540" />
                  <XAxis dataKey="month" stroke="#475569" fontSize={10} />
                  <YAxis stroke="#475569" fontSize={10} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [formatVal(Number(v)), ""]} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px", color: "#94a3b8" }} />
                  <Bar dataKey="income"  name="Income"  fill="#10b981" radius={[4, 4, 0, 0]} style={NO_CLICK_STYLE} />
                  <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} style={NO_CLICK_STYLE} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── CHART 4: Payment Methods ── */}
        {(activeTab === "all" || activeTab === "payment") && (
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex flex-col">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                Payment Methods
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Spending by payment channel</p>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={paymentData}
                  layout="vertical"
                  margin={{ top: 6, right: 16, left: 36, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2540" horizontal={false} />
                  <XAxis type="number" stroke="#475569" fontSize={10} />
                  <YAxis dataKey="method" type="category" stroke="#475569" fontSize={10} width={60} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [formatVal(Number(v)), "Total"]} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="amount" name="Volume" fill="#06b6d4" radius={[0, 4, 4, 0]} style={NO_CLICK_STYLE} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
