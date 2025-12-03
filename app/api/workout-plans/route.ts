import { NextResponse } from "next/server";
import {
  getAllWorkoutPlans,
  createWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  getExercisesByWorkoutPlan,
} from "@/lib/db";

// GET all workout plans with their exercises
export async function GET() {
  try {
    const plans = await getAllWorkoutPlans();

    // Fetch exercises for each plan
    const plansWithExercises = await Promise.all(
      plans.map(async (plan) => {
        const exercises = await getExercisesByWorkoutPlan(plan.id);
        return { ...plan, exercises };
      })
    );

    return NextResponse.json(plansWithExercises);
  } catch (error) {
    console.error("Error fetching workout plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch workout plans" },
      { status: 500 }
    );
  }
}

// POST create a new workout plan
export async function POST(request: Request) {
  try {
    const { dayOfWeek, name } = await request.json();

    if (dayOfWeek === undefined || !name) {
      return NextResponse.json(
        { error: "Day of week and name are required" },
        { status: 400 }
      );
    }

    const newPlan = await createWorkoutPlan(dayOfWeek, name);
    return NextResponse.json(newPlan, { status: 201 });
  } catch (error) {
    console.error("Error creating workout plan:", error);
    return NextResponse.json(
      { error: "Failed to create workout plan" },
      { status: 500 }
    );
  }
}

// PUT update a workout plan
export async function PUT(request: Request) {
  try {
    const { id, name } = await request.json();

    if (!id || !name) {
      return NextResponse.json(
        { error: "ID and name are required" },
        { status: 400 }
      );
    }

    await updateWorkoutPlan(id, name);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating workout plan:", error);
    return NextResponse.json(
      { error: "Failed to update workout plan" },
      { status: 500 }
    );
  }
}

// DELETE a workout plan
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await deleteWorkoutPlan(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting workout plan:", error);
    return NextResponse.json(
      { error: "Failed to delete workout plan" },
      { status: 500 }
    );
  }
}
