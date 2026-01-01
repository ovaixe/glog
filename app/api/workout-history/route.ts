import { NextResponse } from "next/server";
import { saveWorkoutHistory, getWorkoutHistoryWithPlan } from "@/lib/db";
import { getUserFromRequest, unauthorizedResponse } from "@/lib/auth-server";

// GET workout history
export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const history = await getWorkoutHistoryWithPlan(user.id, limit, offset);
    return NextResponse.json(history);
  } catch (error) {
    console.error("Error fetching workout history:", error);
    return NextResponse.json(
      { error: "Failed to fetch workout history" },
      { status: 500 }
    );
  }
}

// POST save completed workout
export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { workoutPlanId, exercisesData, durationSeconds } =
      await request.json();

    if (!workoutPlanId || !exercisesData) {
      return NextResponse.json(
        { error: "Workout plan ID and exercises data are required" },
        { status: 400 }
      );
    }

    const history = await saveWorkoutHistory(
      user.id,
      workoutPlanId,
      exercisesData,
      durationSeconds
    );
    return NextResponse.json(history, { status: 201 });
  } catch (error) {
    console.error("Error saving workout history:", error);
    return NextResponse.json(
      { error: "Failed to save workout history" },
      { status: 500 }
    );
  }
}
