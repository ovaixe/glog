import { NextResponse } from "next/server";
import { saveWorkoutHistory, getWorkoutHistoryWithPlan } from "@/lib/db";

// GET workout history
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const history = await getWorkoutHistoryWithPlan(limit, offset);
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
    const { workoutPlanId, exercisesData } = await request.json();

    if (!workoutPlanId || !exercisesData) {
      return NextResponse.json(
        { error: "Workout plan ID and exercises data are required" },
        { status: 400 }
      );
    }

    const history = await saveWorkoutHistory(workoutPlanId, exercisesData);
    return NextResponse.json(history, { status: 201 });
  } catch (error) {
    console.error("Error saving workout history:", error);
    return NextResponse.json(
      { error: "Failed to save workout history" },
      { status: 500 }
    );
  }
}
