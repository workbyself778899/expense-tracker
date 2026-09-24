import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Expense from "@/models/Expense";
import { getAuthUser } from "@/lib/auth";

const CATEGORY_COLORS: Record<string, string> = {
  "Food & Dining": "#f97316", // Orange
  "Transportation": "#3b82f6", // Blue
  "Housing & Rent": "#8b5cf6", // Purple
  "Utilities & Bills": "#06b6d4", // Cyan
  "Entertainment": "#ec4899", // Pink
  "Shopping": "#eab308", // Yellow
  "Health & Fitness": "#10b981", // Emerald
  "Education": "#6366f1", // Indigo
  "Travel": "#14b8a6", // Teal
  "Salary": "#22c55e", // Green
  "Freelance & Business": "#84cc16", // Lime
  "Investments": "#a855f7", // Violet
  "Gifts & Donations": "#f43f5e", // Rose
  "Other": "#64748b", // Slate
};

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get("timeRange") || "30d";

    const now = new Date();
    const startDate = new Date();

    if (timeRange === "7d") {
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === "30d") {
      startDate.setDate(now.getDate() - 30);
    } else if (timeRange === "90d") {
      startDate.setDate(now.getDate() - 90);
    } else if (timeRange === "year") {
      startDate.setFullYear(now.getFullYear(), 0, 1);
    } else if (timeRange === "all") {
      startDate.setFullYear(2000, 0, 1);
    } else {
      startDate.setDate(now.getDate() - 30);
    }

    // Strictly filter by the authenticated user's ID
    const query = {
      userId: auth.userId,
      date: { $gte: startDate },
    };

    const transactions = await Expense.find(query).sort({ date: 1 }).lean();

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals: Record<string, { amount: number; count: number }> = {};
    const paymentTotals: Record<string, { amount: number; count: number }> = {};
    const dailyMap: Record<string, { income: number; expense: number }> = {};

    transactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      const dateKey = new Date(tx.date).toISOString().split("T")[0];

      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { income: 0, expense: 0 };
      }

      if (tx.type === "income") {
        totalIncome += amt;
        dailyMap[dateKey].income += amt;
      } else {
        totalExpense += amt;
        dailyMap[dateKey].expense += amt;

        // Category breakdown (for expenses)
        const cat = tx.category || "Other";
        if (!categoryTotals[cat]) {
          categoryTotals[cat] = { amount: 0, count: 0 };
        }
        categoryTotals[cat].amount += amt;
        categoryTotals[cat].count += 1;
      }

      // Payment method breakdown
      let method = tx.paymentMethod || "Cash";
      if (method === "Online / UPI") {
        method = "e-Sewa / Wallet";
      }
      if (!paymentTotals[method]) {
        paymentTotals[method] = { amount: 0, count: 0 };
      }
      paymentTotals[method].amount += amt;
      paymentTotals[method].count += 1;
    });

    const netBalance = totalIncome - totalExpense;
    const savingsRate =
      totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

    // Convert category map to sorted array with percentages & colors
    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([category, data]) => ({
        category,
        amount: Math.round(data.amount * 100) / 100,
        count: data.count,
        percentage:
          totalExpense > 0 ? Math.round((data.amount / totalExpense) * 100) : 0,
        color: CATEGORY_COLORS[category] || "#94a3b8",
      }))
      .sort((a, b) => b.amount - a.amount);

    const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;

    // Daily trends array
    const dailyTrends = Object.entries(dailyMap)
      .map(([date, values]) => ({
        date,
        income: Math.round(values.income * 100) / 100,
        expense: Math.round(values.expense * 100) / 100,
        net: Math.round((values.income - values.expense) * 100) / 100,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Monthly trends (grouping by YYYY-MM)
    const monthlyMap: Record<string, { income: number; expense: number }> = {};
    transactions.forEach((tx) => {
      const monthKey = new Date(tx.date).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { income: 0, expense: 0 };
      }
      if (tx.type === "income") {
        monthlyMap[monthKey].income += Number(tx.amount) || 0;
      } else {
        monthlyMap[monthKey].expense += Number(tx.amount) || 0;
      }
    });

    const monthlyTrends = Object.entries(monthlyMap).map(([month, data]) => ({
      month,
      income: Math.round(data.income),
      expense: Math.round(data.expense),
    }));

    // Payment methods array
    const paymentMethodBreakdown = Object.entries(paymentTotals).map(
      ([method, data]) => ({
        method,
        amount: Math.round(data.amount * 100) / 100,
        count: data.count,
      })
    );

    const daysCount = Math.max(
      1,
      Math.round((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    );
    const avgDailyExpense = Math.round((totalExpense / daysCount) * 100) / 100;

    return NextResponse.json({
      success: true,
      data: {
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpense: Math.round(totalExpense * 100) / 100,
        netBalance: Math.round(netBalance * 100) / 100,
        savingsRate,
        transactionCount: transactions.length,
        avgDailyExpense,
        topCategory,
        categoryBreakdown,
        dailyTrends,
        monthlyTrends,
        paymentMethodBreakdown,
      },
    });
  } catch (error: unknown) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to aggregate statistics",
      },
      { status: 500 }
    );
  }
}
