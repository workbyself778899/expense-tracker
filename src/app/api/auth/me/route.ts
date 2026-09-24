import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ success: true, user: null });
    }

    await connectDB();
    const user = await User.findById(auth.userId).select("-password").lean();
    if (!user) {
      return NextResponse.json({ success: true, user: null });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        currency: user.currency || "NRP",
      },
    });
  } catch (error: unknown) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get current user session" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { currency } = body;

    if (!currency || typeof currency !== "string") {
      return NextResponse.json(
        { success: false, error: "Currency value is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const updated = await User.findByIdAndUpdate(
      auth.userId,
      { currency: currency.trim() },
      { new: true }
    ).select("-password");

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updated._id.toString(),
        name: updated.name,
        email: updated.email,
        currency: updated.currency,
      },
      message: "Currency preference updated",
    });
  } catch (error: unknown) {
    console.error("PUT /api/auth/me error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}
