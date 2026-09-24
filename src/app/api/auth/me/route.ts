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
