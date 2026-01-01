import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

const url = process.env.TURSO_DATABASE_URL || "file:workout.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

export const db = createClient({
  url,
  authToken,
});

// Types
export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface WorkoutPlan {
  id: number;
  user_id: number;
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
  user_id: number;
  workout_plan_id: number;
  completed_at: string;
  exercises_data: string;
  duration_seconds: number | null;
}

// User Management
export async function createUser(
  username: string,
  password: string
): Promise<User> {
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const result = await db.execute({
      sql: "INSERT INTO users (username, password_hash) VALUES (?, ?) RETURNING id, username, created_at",
      args: [username, passwordHash],
    });
    return result.rows[0] as unknown as User;
  } catch (e: any) {
    if (e.message?.includes("UNIQUE constraint failed")) {
      throw new Error("Username already exists");
    }
    throw e;
  }
}

export async function verifyUser(
  username: string,
  password: string
): Promise<User | null> {
  const result = await db.execute({
    sql: "SELECT * FROM users WHERE username = ?",
    args: [username],
  });

  if (result.rows.length === 0) return null;

  const user = result.rows[0] as any;
  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) return null;

  return {
    id: user.id,
    username: user.username,
    created_at: user.created_at,
  };
}

// Session Management
// Session Management
export async function createSession(
  userId: number,
  token: string
): Promise<void> {
  // Set expiration to 30 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await db.execute({
    sql: "INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)",
    args: [userId, token, expiresAt.toISOString()],
  });
}

export async function getSessionUser(token: string): Promise<User | null> {
  const result = await db.execute({
    sql: `
      SELECT u.id, u.username, u.created_at 
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ? AND s.expires_at > datetime('now')
    `,
    args: [token],
  });

  if (result.rows.length === 0) return null;
  return result.rows[0] as unknown as User;
}

export async function deleteSession(token: string): Promise<void> {
  await db.execute({
    sql: "DELETE FROM sessions WHERE token = ?",
    args: [token],
  });
}

// Workout Plan CRUD
// Workout Plan CRUD
export async function getAllWorkoutPlans(
  userId: number
): Promise<WorkoutPlan[]> {
  const result = await db.execute({
    sql: "SELECT * FROM workout_plans WHERE user_id = ? ORDER BY day_of_week",
    args: [userId],
  });
  return result.rows as unknown as WorkoutPlan[];
}

export async function getWorkoutPlanByDay(
  userId: number,
  dayOfWeek: number
): Promise<WorkoutPlan | undefined> {
  const result = await db.execute({
    sql: "SELECT * FROM workout_plans WHERE user_id = ? AND day_of_week = ?",
    args: [userId, dayOfWeek],
  });
  return result.rows[0] as unknown as WorkoutPlan | undefined;
}

export async function createWorkoutPlan(
  userId: number,
  dayOfWeek: number,
  name: string
): Promise<WorkoutPlan> {
  const result = await db.execute({
    sql: "INSERT INTO workout_plans (user_id, day_of_week, name) VALUES (?, ?, ?) RETURNING *",
    args: [userId, dayOfWeek, name],
  });
  return result.rows[0] as unknown as WorkoutPlan;
}

export async function updateWorkoutPlan(
  userId: number,
  id: number,
  name: string
): Promise<void> {
  await db.execute({
    sql: "UPDATE workout_plans SET name = ? WHERE id = ? AND user_id = ?",
    args: [name, id, userId],
  });
}

export async function deleteWorkoutPlan(
  userId: number,
  id: number
): Promise<void> {
  await db.execute({
    sql: "DELETE FROM workout_plans WHERE id = ? AND user_id = ?",
    args: [id, userId],
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
  userId: number,
  workoutPlanId: number,
  name: string,
  sets: number | null,
  reps: number | null,
  weight: number | null,
  orderIndex: number
): Promise<Exercise> {
  // Verify plan belongs to user
  const plan = await db.execute({
    sql: "SELECT id FROM workout_plans WHERE id = ? AND user_id = ?",
    args: [workoutPlanId, userId],
  });

  if (plan.rows.length === 0) {
    throw new Error("Workout plan not found or unauthorized");
  }

  const result = await db.execute({
    sql: `INSERT INTO exercises (workout_plan_id, name, sets, reps, weight, order_index) 
          VALUES (?, ?, ?, ?, ?, ?) RETURNING *`,
    args: [workoutPlanId, name, sets, reps, weight, orderIndex],
  });
  return result.rows[0] as unknown as Exercise;
}

export async function updateExercise(
  userId: number,
  id: number,
  name: string,
  sets: number | null,
  reps: number | null,
  weight: number | null
): Promise<void> {
  // Check ownership via subquery
  const check = await db.execute({
    sql: `SELECT e.id FROM exercises e 
          JOIN workout_plans wp ON e.workout_plan_id = wp.id 
          WHERE e.id = ? AND wp.user_id = ?`,
    args: [id, userId],
  });

  if (check.rows.length === 0) return; // Or throw

  await db.execute({
    sql: "UPDATE exercises SET name = ?, sets = ?, reps = ?, weight = ? WHERE id = ?",
    args: [name, sets, reps, weight, id],
  });
}

export async function deleteExercise(
  userId: number,
  id: number
): Promise<void> {
  // Check ownership via subquery
  const check = await db.execute({
    sql: `SELECT e.id FROM exercises e 
          JOIN workout_plans wp ON e.workout_plan_id = wp.id 
          WHERE e.id = ? AND wp.user_id = ?`,
    args: [id, userId],
  });

  if (check.rows.length === 0) return;

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
// Workout History
export async function saveWorkoutHistory(
  userId: number,
  workoutPlanId: number,
  exercisesData: Exercise[],
  durationSeconds?: number
): Promise<WorkoutHistory> {
  const result = await db.execute({
    sql: `INSERT INTO workout_history (user_id, workout_plan_id, exercises_data, duration_seconds) 
          VALUES (?, ?, ?, ?) RETURNING *`,
    args: [
      userId,
      workoutPlanId,
      JSON.stringify(exercisesData),
      durationSeconds ?? null,
    ],
  });
  return result.rows[0] as unknown as WorkoutHistory;
}

export async function getWorkoutHistory(
  userId: number,
  limit: number = 50,
  offset: number = 0
): Promise<WorkoutHistory[]> {
  const result = await db.execute({
    sql: "SELECT * FROM workout_history WHERE user_id = ? ORDER BY completed_at DESC LIMIT ? OFFSET ?",
    args: [userId, limit, offset],
  });
  return result.rows as unknown as WorkoutHistory[];
}

export async function getWorkoutHistoryWithPlan(
  userId: number,
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
      WHERE wh.user_id = ?
      ORDER BY wh.completed_at DESC
      LIMIT ? OFFSET ?
    `,
    args: [userId, limit, offset],
  });
  return result.rows;
}
