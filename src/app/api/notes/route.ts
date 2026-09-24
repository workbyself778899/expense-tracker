import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Note from "@/models/Note";
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
    const pinned = searchParams.get("pinned");

    const query: Record<string, unknown> = {
      userId: auth.userId,
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { plainText: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (pinned === "true") {
      query.isPinned = true;
    }

    // Pinned notes come first, then latest updated
    const notes = await Note.find(query)
      .sort({ isPinned: -1, updatedAt: -1 })
      .populate("linkedExpenseId", "title amount type")
      .lean();

    return NextResponse.json({
      success: true,
      data: notes,
      count: notes.length,
    });
  } catch (error: unknown) {
    console.error("GET /api/notes error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch notes",
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

    const {
      title,
      content,
      plainText,
      category,
      color,
      isPinned,
      handwritingDataUrl,
      tags,
      linkedExpenseId,
    } = body;

    const note = await Note.create({
      userId: auth.userId,
      title: (title || "Untitled Note").trim(),
      content: content || "",
      plainText: plainText || "",
      category: category || "General",
      color: color || "indigo",
      isPinned: Boolean(isPinned),
      handwritingDataUrl: handwritingDataUrl || undefined,
      tags: Array.isArray(tags) ? tags : [],
      linkedExpenseId: linkedExpenseId || undefined,
    });

    return NextResponse.json(
      { success: true, data: note, message: "Note created successfully" },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/notes error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create note",
      },
      { status: 500 }
    );
  }
}
