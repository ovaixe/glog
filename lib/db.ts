import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL || "file:workout.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

export const db = createClient({
  url,
  authToken,
});

// Types
export interface WorkoutPlan {
  id: number;
  day_of_week: number;
  name: string;
  created_at: string;
}

export interface Exercise {
  id: number;
  workout_plan_id: number;
  name: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  order_index: number;
}

export interface WorkoutHistory {
  id: number;
  workout_plan_id: number;
  completed_at: string;
  exercises_data: string;
  duration_seconds: number | null;
}

// Session Management
export async function createSession(token: string): Promise<void> {
  // Set expiration to 30 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await db.execute({
    sql: "INSERT INTO sessions (token, expires_at) VALUES (?, ?)",
    args: [token, expiresAt.toISOString()],
  });
}

export async function verifySession(token: string): Promise<boolean> {
  const result = await db.execute({
    sql: "SELECT * FROM sessions WHERE token = ? AND expires_at > datetime('now')",
    args: [token],
  });
  return result.rows.length > 0;
}

export async function deleteSession(token: string): Promise<void> {
  await db.execute({
    sql: "DELETE FROM sessions WHERE token = ?",
    args: [token],
  });
}

// Workout Plan CRUD
export async function getAllWorkoutPlans(): Promise<WorkoutPlan[]> {
  const result = await db.execute(
    "SELECT * FROM workout_plans ORDER BY day_of_week"
  );
  return result.rows as unknown as WorkoutPlan[];
}

export async function getWorkoutPlanByDay(
  dayOfWeek: number
): Promise<WorkoutPlan | undefined> {
  const result = await db.execute({
    sql: "SELECT * FROM workout_plans WHERE day_of_week = ?",
    args: [dayOfWeek],
  });
  return result.rows[0] as unknown as WorkoutPlan | undefined;
}

export async function createWorkoutPlan(
  dayOfWeek: number,
  name: string
): Promise<WorkoutPlan> {
  const result = await db.execute({
    sql: "INSERT INTO workout_plans (day_of_week, name) VALUES (?, ?) RETURNING *",
    args: [dayOfWeek, name],
  });
  return result.rows[0] as unknown as WorkoutPlan;
}

export async function updateWorkoutPlan(
  id: number,
  name: string
): Promise<void> {
  await db.execute({
    sql: "UPDATE workout_plans SET name = ? WHERE id = ?",
    args: [name, id],
  });
}

export async function deleteWorkoutPlan(id: number): Promise<void> {
  await db.execute({
    sql: "DELETE FROM workout_plans WHERE id = ?",
    args: [id],
  });
}

// Exercise CRUD
export async function getExercisesByWorkoutPlan(
  workoutPlanId: number
): Promise<Exercise[]> {
  const result = await db.execute({
    sql: "SELECT * FROM exercises WHERE workout_plan_id = ? ORDER BY order_index",
    args: [workoutPlanId],
  });
  return result.rows as unknown as Exercise[];
}

export async function createExercise(
  workoutPlanId: number,
  name: string,
  sets: number | null,
  reps: number | null,
  weight: number | null,
  orderIndex: number
): Promise<Exercise> {
  const result = await db.execute({
    sql: `INSERT INTO exercises (workout_plan_id, name, sets, reps, weight, order_index) 
          VALUES (?, ?, ?, ?, ?, ?) RETURNING *`,
    args: [workoutPlanId, name, sets, reps, weight, orderIndex],
  });
  return result.rows[0] as unknown as Exercise;
}

export async function updateExercise(
  id: number,
  name: string,
  sets: number | null,
  reps: number | null,
  weight: number | null
): Promise<void> {
  await db.execute({
    sql: "UPDATE exercises SET name = ?, sets = ?, reps = ?, weight = ? WHERE id = ?",
    args: [name, sets, reps, weight, id],
  });
}

export async function deleteExercise(id: number): Promise<void> {
  await db.execute({
    sql: "DELETE FROM exercises WHERE id = ?",
    args: [id],
  });
}

export async function reorderExercises(exerciseIds: number[]): Promise<void> {
  // LibSQL doesn't support transaction() helper like better-sqlite3 yet in the same way,
  // but we can execute multiple statements or use a batch if supported.
  // For now, we'll just await sequentially which is fine for small lists.
  for (let i = 0; i < exerciseIds.length; i++) {
    await db.execute({
      sql: "UPDATE exercises SET order_index = ? WHERE id = ?",
      args: [i, exerciseIds[i]],
    });
  }
}

// Workout History
export async function saveWorkoutHistory(
  workoutPlanId: number,
  exercisesData: Exercise[],
  durationSeconds?: number
): Promise<WorkoutHistory> {
  const result = await db.execute({
    sql: `INSERT INTO workout_history (workout_plan_id, exercises_data, duration_seconds) 
          VALUES (?, ?, ?) RETURNING *`,
    args: [
      workoutPlanId,
      JSON.stringify(exercisesData),
      durationSeconds ?? null,
    ],
  });
  return result.rows[0] as unknown as WorkoutHistory;
}

export async function getWorkoutHistory(
  limit: number = 50,
  offset: number = 0
): Promise<WorkoutHistory[]> {
  const result = await db.execute({
    sql: "SELECT * FROM workout_history ORDER BY completed_at DESC LIMIT ? OFFSET ?",
    args: [limit, offset],
  });
  return result.rows as unknown as WorkoutHistory[];
}

export async function getWorkoutHistoryWithPlan(
  limit: number = 50,
  offset: number = 0
) {
  const result = await db.execute({
    sql: `
      SELECT 
        wh.*,
        wp.name as workout_name,
        wp.day_of_week
      FROM workout_history wh
      JOIN workout_plans wp ON wh.workout_plan_id = wp.id
      ORDER BY wh.completed_at DESC
      LIMIT ? OFFSET ?
    `,
    args: [limit, offset],
  });
  return result.rows;
}
