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
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Last 90 Days", value: "90d" },
  { label: "This Year", value: "year" },
  { label: "All Time", value: "all" },
];

export default function ChartsView({
  stats,
  timeRange,
  onTimeRangeChange,
  isLoading = false,
}: ChartsViewProps) {
  const { currency, formatAmount } = useCurrency();
  const [activeTab, setActiveTab] = useState<"all" | "trend" | "category" | "cashflow" | "payment">("all");

  if (isLoading) {
    return (
      <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-800 rounded w-1/4 mx-auto"></div>
          <div className="h-64 bg-slate-800/50 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const categoryData = stats?.categoryBreakdown || [];
  const dailyData = stats?.dailyTrends || [];
  const monthlyData = stats?.monthlyTrends || [];
  const paymentData = stats?.paymentMethodBreakdown || [];

  const hasData =
    (stats?.totalExpense || 0) > 0 || (stats?.totalIncome || 0) > 0;

  if (!hasData) {
    return (
      <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800/80">
        <PieIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-300">No chart data yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Record your first income or expense transaction to unlock multi-chart analytics and spending breakdowns.
        </p>
      </div>
    );
  }

  // Format currency tooltip
  const formatCurrency = (val: number | string | undefined) => formatAmount(val);

  return (
    <div className="space-y-6">
      {/* Top Controls: Time Filter & Chart View Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800/80 shadow-md">
        {/* Chart View Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
              activeTab === "all"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            All Charts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("trend")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
              activeTab === "trend"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Spending Trend
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("category")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
              activeTab === "category"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            Categories
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("cashflow")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
              activeTab === "cashflow"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Income vs Expense
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("payment")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
              activeTab === "payment"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Payment Methods
          </button>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value)}
            className="bg-slate-950/80 border border-slate-700/80 text-slate-200 text-xs font-medium rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {TIME_RANGES.map((tr) => (
              <option key={tr.value} value={tr.value} className="bg-slate-900">
                {tr.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Spending Trend (Area Chart) */}
        {(activeTab === "all" || activeTab === "trend") && (
          <div
            className={`p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl flex flex-col ${
              activeTab === "trend" ? "lg:col-span-2" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-rose-400" />
                  Expense & Income Timeline
                </h3>
                <p className="text-xs text-slate-400">
                  Daily cash inflow and spending flow
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {dailyData.length} active days
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dailyData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(str) => {
                      const d = new Date(str);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                  />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "#f8fafc",
                    }}
                    formatter={(val) => [formatCurrency(Number(val)), ""]}
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#expenseGrad)"
                    name="Expense"
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#incomeGrad)"
                    name="Income"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 2: Category Breakdown (Donut / Pie Chart) */}
        {(activeTab === "all" || activeTab === "category") && (
          <div
            className={`p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl flex flex-col ${
              activeTab === "category" ? "lg:col-span-2" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-indigo-400" />
                  Category Breakdown
                </h3>
                <p className="text-xs text-slate-400">
                  Where your expenses are distributed
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {categoryData.length} categories
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 flex-1">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || "#6366f1"} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "12px",
                        fontSize: "12px",
                        color: "#f8fafc",
                      }}
                      formatter={(val) => [formatCurrency(Number(val)), "Spent"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Legend list */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {categoryData.map((cat) => (
                  <div
                    key={cat.category}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/40 text-xs border border-slate-800/60"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color || "#6366f1" }}
                      />
                      <span className="text-slate-300 font-medium truncate">
                        {cat.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-slate-200">
                      <span>{formatAmount(cat.amount)}</span>
                      <span className="text-[10px] text-slate-400 font-sans">
                        ({cat.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CHART 3: Income vs Expense Comparison (Bar Chart) */}
        {(activeTab === "all" || activeTab === "cashflow") && (
          <div
            className={`p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl flex flex-col ${
              activeTab === "cashflow" ? "lg:col-span-2" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  Monthly Income vs Expenses
                </h3>
                <p className="text-xs text-slate-400">
                  Compare total inflow vs expenditure by month
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData.length > 0 ? monthlyData : [
                    { month: "Current", income: stats?.totalIncome || 0, expense: stats?.totalExpense || 0 }
                  ]}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "#f8fafc",
                    }}
                    formatter={(val) => [formatCurrency(Number(val)), ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 4: Payment Methods Breakdown (Horizontal Bar Chart) */}
        {(activeTab === "all" || activeTab === "payment") && (
          <div
            className={`p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl flex flex-col ${
              activeTab === "payment" ? "lg:col-span-2" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-cyan-400" />
                  Payment Methods
                </h3>
                <p className="text-xs text-slate-400">
                  Transactions by payment channel
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={paymentData}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={11} />
                  <YAxis dataKey="method" type="category" stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "#f8fafc",
                    }}
                    formatter={(val) => [formatCurrency(Number(val)), "Total"]}
                  />
                  <Bar dataKey="amount" name={`Volume (${currency})`} fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
