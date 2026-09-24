import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    success: false,
    message: "Demo data has been disabled. Every transaction and note is strictly tied to each registered user account.",
  });
}
