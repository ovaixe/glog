import { Migration } from "../migrations";
import { db } from "../db";

export const migration_003: Migration = {
  version: 3,
  name: "add_users_table",

  async up() {
    // 1. Create users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Recreate workout_plans to add user_id and fix unique constraint
    // Disable FKs temporarily if needed, though usually safer to just handle it
    // SQLite doesn't let us easily drop constraints

    await db.execute(`
      CREATE TABLE new_workout_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day_of_week INTEGER NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Copy existing data (orphaned plans will have NULL user_id)
    await db.execute(`
      INSERT INTO new_workout_plans (id, day_of_week, name, created_at)
      SELECT id, day_of_week, name, created_at FROM workout_plans
    `);

    // We can't drop workout_plans while exercises references it?
    // Usually we have to recreate exercises too if we want to be safe,
    // OR we can rely on SQLite not enforcing it during schema changes if we are careful.
    // simpler: turn off foreign keys
    try {
      await db.execute("PRAGMA foreign_keys = OFF");

      await db.execute("DROP TABLE workout_plans");
      await db.execute("ALTER TABLE new_workout_plans RENAME TO workout_plans");

      // Add new unique index
      await db.execute(`
            CREATE UNIQUE INDEX idx_plans_user_day 
            ON workout_plans(user_id, day_of_week)
        `);
    } finally {
      await db.execute("PRAGMA foreign_keys = ON");
    }

    // 3. Update workout_history
    await db.execute(`
      ALTER TABLE workout_history
      ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
    `);

    // 4. Update sessions
    await db.execute(`
      ALTER TABLE sessions
      ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
    `);

    // Also add index for sessions user_id
    await db.execute(`
        CREATE INDEX idx_sessions_user ON sessions(user_id)
    `);
  },

  async down() {
    // This is destructive and complex to reverse perfectly given the constraints
    // For now we just implement basic reversal where possible

    await db.execute("ALTER TABLE sessions DROP COLUMN user_id");
    await db.execute("ALTER TABLE workout_history DROP COLUMN user_id");

    // Reverting workout_plans is hard, skipping for now

    await db.execute("DROP TABLE users");
  },
};
