import { NextResponse } from "next/server";
import crypto from "crypto";

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
      // Generate a simple token (hash of secret + timestamp)
      const token = crypto
        .createHash("sha256")
        .update(SECRET_KEY + Date.now())
        .digest("hex");

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
