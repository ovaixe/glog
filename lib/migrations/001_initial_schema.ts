import { Migration } from "../migrations";
import db from "../db";

/**
 * Initial schema migration
 * Creates all base tables for the workout tracking application
 */
export const migration_001: Migration = {
  version: 1,
  name: "initial_schema",

  async up() {
    // Create workout_plans table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS workout_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day_of_week INTEGER NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(day_of_week)
      )
    `);

    // Create exercises table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workout_plan_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        sets INTEGER,
        reps INTEGER,
        weight REAL,
        order_index INTEGER NOT NULL,
        FOREIGN KEY (workout_plan_id) REFERENCES workout_plans(id) ON DELETE CASCADE
      )
    `);

    // Create workout_history table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS workout_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workout_plan_id INTEGER NOT NULL,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        exercises_data TEXT NOT NULL,
        FOREIGN KEY (workout_plan_id) REFERENCES workout_plans(id)
      )
    `);

    // Create sessions table for authentication
    await db.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME
      )
    `);

    // Create indexes
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_exercises_workout_plan 
        ON exercises(workout_plan_id)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_history_completed 
        ON workout_history(completed_at DESC)
    `);
  },

  async down() {
    // Drop tables in reverse order (respecting foreign keys)
    await db.execute("DROP INDEX IF EXISTS idx_history_completed");
    await db.execute("DROP INDEX IF EXISTS idx_exercises_workout_plan");
    await db.execute("DROP TABLE IF EXISTS sessions");
    await db.execute("DROP TABLE IF EXISTS workout_history");
    await db.execute("DROP TABLE IF EXISTS exercises");
    await db.execute("DROP TABLE IF EXISTS workout_plans");
  },
};
