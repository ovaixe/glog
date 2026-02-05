import { Migration } from "../migrations";
import db from "../db";

export const migration_006: Migration = {
  version: 6,
  name: "update_workout_history",

  async up() {
        await db.execute(`
            BEGIN TRANSACTION;

            -- Create new table with ON DELETE SET NULL constraint
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

            -- Copy all existing data
            INSERT INTO workout_history_new 
                (id, user_id, workout_plan_id, completed_at, duration_seconds, exercises_data)
            SELECT id, user_id, workout_plan_id, completed_at, duration_seconds, exercises_data
            FROM workout_history;

            -- Drop old table
            DROP TABLE workout_history;

            -- Rename new table
            ALTER TABLE workout_history_new RENAME TO workout_history;

            -- Recreate indexes
            CREATE INDEX IF NOT EXISTS idx_history_completed 
                ON workout_history(completed_at DESC);
            CREATE INDEX IF NOT EXISTS idx_workout_history_plan_id 
                ON workout_history(workout_plan_id);
            CREATE INDEX IF NOT EXISTS idx_workout_history_user_id 
                ON workout_history(user_id);

            COMMIT;
            `);
        },

  async down() {
        await db.execute(`
            BEGIN TRANSACTION;

            -- Revert to original table without ON DELETE constraints
            CREATE TABLE IF NOT EXISTS workout_history_old (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            workout_plan_id INTEGER NOT NULL,
            completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            duration_seconds INTEGER,
            exercises_data TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (workout_plan_id) REFERENCES workout_plans(id)
            );

            -- Copy all data back
            INSERT INTO workout_history_old 
            (id, user_id, workout_plan_id, completed_at, duration_seconds, exercises_data)
            SELECT id, user_id, workout_plan_id, completed_at, duration_seconds, exercises_data
            FROM workout_history;

            -- Drop the table with constraints
            DROP TABLE workout_history;

            -- Rename old table back
            ALTER TABLE workout_history_old RENAME TO workout_history;

            -- Recreate indexes
            CREATE INDEX IF NOT EXISTS idx_history_completed 
            ON workout_history(completed_at DESC);
            CREATE INDEX IF NOT EXISTS idx_workout_history_plan_id 
            ON workout_history(workout_plan_id);
            CREATE INDEX IF NOT EXISTS idx_workout_history_user_id 
            ON workout_history(user_id);

            COMMIT;
        `);
  },
};
