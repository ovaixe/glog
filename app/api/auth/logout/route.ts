import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (token) {
      await deleteSession(token);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
