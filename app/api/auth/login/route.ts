import { NextResponse } from "next/server";
import crypto from "crypto";
import { createSession } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { key } = await request.json();

    if (!key) {
      return NextResponse.json(
        { error: "Access key is required" },
        { status: 400 }
      );
    }

    const SECRET_KEY = process.env.GLOG_SECRET_KEY;

    if (!SECRET_KEY) {
      console.error("GLOG_SECRET_KEY is not set in environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Compare the provided key with the secret key
    if (key === SECRET_KEY) {
      // Generate a secure random token
      const token = crypto.randomBytes(32).toString("hex");

      // Store token in database
      await createSession(token);

      return NextResponse.json({ token, success: true });
    }

    return NextResponse.json({ error: "Invalid access key" }, { status: 401 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
