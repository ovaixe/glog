import { NextResponse } from "next/server";
import { getSessionUser, User } from "@/lib/db";

export async function getUserFromRequest(
  request: Request
): Promise<User | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  return getSessionUser(token);
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
