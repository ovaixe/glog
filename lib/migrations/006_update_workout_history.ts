import { Migration } from "../migrations";
import db from "../db";

export const migration_006: Migration = {
  version: 6,
  name: "update_workout_history",

  async up() {
    // Create new table with ON DELETE SET NULL constraint
    await db.execute(`
        CREATE TABLE IF NOT EXISTS workout_history_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            workout_plan_id INTEGER NOT NULL,
            completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            duration_seconds INTEGER,
            exercises_data TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (workout_plan_id) REFERENCES workout_plans(id) ON DELETE SET NULL
        );
    `);

    // Copy all existing data
    await db.execute(`
        INSERT INTO workout_history_new 
            (id, user_id, workout_plan_id, completed_at, duration_seconds, exercises_data)
        SELECT id, user_id, workout_plan_id, completed_at, duration_seconds, exercises_data
        FROM workout_history;
    `);

    // Drop old table
    await db.execute(`
        DROP TABLE workout_history;
    `);

    // Rename new table
    await db.execute(`
        ALTER TABLE workout_history_new RENAME TO workout_history;
    `);

    // Recreate indexes
    await db.execute(`
        CREATE INDEX IF NOT EXISTS idx_history_completed 
            ON workout_history(completed_at DESC);
    `);
  },

  async down() {
    // Revert ON DELETE SET NULL constraint
    await db.execute(`
        CREATE TABLE IF NOT EXISTS workout_history_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            workout_plan_id INTEGER NOT NULL,
            completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            duration_seconds INTEGER,
            exercises_data TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (workout_plan_id) REFERENCES workout_plans(id)
        );
    `);

    // Copy all existing data
    await db.execute(`
        INSERT INTO workout_history_new 
            (id, user_id, workout_plan_id, completed_at, duration_seconds, exercises_data)
        SELECT id, user_id, workout_plan_id, completed_at, duration_seconds, exercises_data
        FROM workout_history;
    `);

    // Drop old table
    await db.execute(`
        DROP TABLE workout_history;
    `);

    // Rename new table
    await db.execute(`
        ALTER TABLE workout_history_new RENAME TO workout_history;
    `);

    // Recreate indexes
    await db.execute(`
        CREATE INDEX IF NOT EXISTS idx_history_completed 
            ON workout_history(completed_at DESC);
    `);
  },
};
