import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Verify token against database
    const user = await getSessionUser(token);

    if (user) {
      return NextResponse.json({
        valid: true,
        user: { id: user.id, username: user.username },
      });
    }

    return NextResponse.json({ valid: false });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
