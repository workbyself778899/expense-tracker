import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Expense from "@/models/Expense";
import { getAuthUser } from "@/lib/auth";

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
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);

    // Filter strictly by the authenticated user's ID
    const query: Record<string, unknown> = {
      userId: auth.userId,
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (type && (type === "expense" || type === "income")) {
      query.type = type;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        (query.date as Record<string, unknown>).$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        (query.date as Record<string, unknown>).$lte = end;
      }
    }

    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("linkedNoteId", "title category")
      .lean();

    return NextResponse.json({
      success: true,
      data: expenses,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error("GET /api/expenses error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch expenses",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();

    const { title, amount, type, category, date, paymentMethod, notes, tags, linkedNoteId } =
      body;

    if (!title || title.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    const expense = await Expense.create({
      userId: auth.userId,
      title: title.trim(),
      amount: Number(amount),
      type: type === "income" ? "income" : "expense",
      category: category || "Food & Dining",
      date: date ? new Date(date) : new Date(),
      paymentMethod: paymentMethod || "Cash",
      notes: notes?.trim() || "",
      tags: Array.isArray(tags) ? tags : [],
      linkedNoteId: linkedNoteId || undefined,
    });

    return NextResponse.json(
      { success: true, data: expense, message: "Transaction created successfully" },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/expenses error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create expense",
      },
      { status: 500 }
    );
  }
}
