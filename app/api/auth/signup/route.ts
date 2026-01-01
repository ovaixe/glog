import { NextResponse } from "next/server";
import { createUser, createSession } from "@/lib/db";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const user = await createUser(username, password);

    // Auto login
    const token = crypto.randomBytes(32).toString("hex");
    await createSession(user.id, token);

    return NextResponse.json({
      token,
      user: { id: user.id, username: user.username },
      success: true,
    });
  } catch (error: any) {
    if (error.message === "Username already exists") {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }

    console.error("Signup error:", error);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
