import { NextRequest, NextResponse } from "next/server";
import {
  getExercisesByWorkoutPlan,
  createExercise,
  updateExercise,
  deleteExercise,
  reorderExercises,
} from "@/lib/db";

// GET exercises for a workout plan
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workoutPlanId = searchParams.get("workout_plan_id");

    if (!workoutPlanId) {
      return NextResponse.json(
        { error: "workout_plan_id is required" },
        { status: 400 }
      );
    }

    const exercises = await getExercisesByWorkoutPlan(parseInt(workoutPlanId));
    return NextResponse.json(exercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json(
      { error: "Failed to fetch exercises" },
      { status: 500 }
    );
  }
}

// POST create a new exercise
export async function POST(request: NextRequest) {
  try {
    const { workout_plan_id, name, sets, reps, weight, order_index } =
      await request.json();

    if (!workout_plan_id || !name || order_index === undefined) {
      return NextResponse.json(
        { error: "workout_plan_id, name, and order_index are required" },
        { status: 400 }
      );
    }

    const exercise = await createExercise(
      workout_plan_id,
      name,
      sets ?? null,
      reps ?? null,
      weight ?? null,
      order_index
    );
    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error("Error creating exercise:", error);
    return NextResponse.json(
      { error: "Failed to create exercise" },
      { status: 500 }
    );
  }
}

// PUT update an exercise
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle reordering
    if (body.reorder && Array.isArray(body.exercise_ids)) {
      await reorderExercises(body.exercise_ids);
      return NextResponse.json({ success: true });
    }

    // Handle regular update
    const { id, name, sets, reps, weight } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: "id and name are required" },
        { status: 400 }
      );
    }

    await updateExercise(id, name, sets ?? null, reps ?? null, weight ?? null);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating exercise:", error);
    return NextResponse.json(
      { error: "Failed to update exercise" },
      { status: 500 }
    );
  }
}

// DELETE an exercise
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await deleteExercise(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting exercise:", error);
    return NextResponse.json(
      { error: "Failed to delete exercise" },
      { status: 500 }
    );
  }
}
