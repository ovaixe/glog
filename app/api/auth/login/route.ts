import { NextResponse } from "next/server";
import crypto from "crypto";
import { verifyUser, createSession } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const user = await verifyUser(username, password);

    if (user) {
      // Generate a secure random token
      const token = crypto.randomBytes(32).toString("hex");

      // Store token in database
      await createSession(user.id, token);

      return NextResponse.json({
        token,
        user: { id: user.id, username: user.username },
        success: true,
      });
    }

    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
