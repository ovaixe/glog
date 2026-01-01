import { Migration } from "../migrations";
import db from "../db";

/**
 * Example Migration: Add duration_seconds field to workout_history
 */

export const migration_002: Migration = {
  version: 2,
  name: "add_duration_seconds_to_workout_history",

  async up() {
    // Add duration_seconds column to workout_history table
    await db.execute(`
        ALTER TABLE workout_history 
        ADD COLUMN duration_seconds INTEGER
      `);

    console.log(
      "  ℹ️  Added 'duration_seconds' column to workout_history table"
    );
  },

  async down() {
    // Note: SQLite doesn't support DROP COLUMN directly
    // To rollback, you would need to recreate the table without the column
    // For production, down() is typically not needed
    console.log("  ⚠️  Rollback not implemented for this migration");
    console.log(
      "  ℹ️  SQLite doesn't support DROP COLUMN - would need table recreation"
    );
  },
};
