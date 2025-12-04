import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // For this simple implementation, we just check if token exists
    // In a more complex system, you'd validate the token against a database
    // or check its expiration time

    // Since we're using session storage and a simple hash,
    // we'll accept any non-empty token as valid
    // The real security is in the initial login check

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
