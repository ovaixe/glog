import { Migration } from "../migrations";
import { db } from "../db";

/**
 * Migration Template
 *
 * Copy this template to create a new migration.
 *
 * Steps:
 * 1. Copy this file to XXX_description.ts (e.g., 002_add_notes_field.ts)
 * 2. Update the version number to match the filename
 * 3. Update the name to describe your change
 * 4. Implement the up() function with your schema changes
 * 5. Optionally implement down() for rollback (development only)
 * 6. Register the migration in lib/migrations/index.ts
 */

export const migration_XXX: Migration = {
  // Version must be unique and sequential
  // @ts-ignore - XXX is a placeholder, replace with actual number
  version: XXX, // Replace XXX with the next number (e.g., 2, 3, 4...)

  // Short description of what this migration does
  name: "description_of_change", // e.g., "add_notes_to_workout_history"

  /**
   * Apply the migration
   * This runs when the migration is applied
   */
  async up() {
    // Example: Add a new column
    // await db.execute(`
    //   ALTER TABLE workout_history
    //   ADD COLUMN notes TEXT
    // `);

    // Example: Create a new table
    // await db.execute(`
    //   CREATE TABLE new_table (
    //     id INTEGER PRIMARY KEY AUTOINCREMENT,
    //     name TEXT NOT NULL,
    //     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    //   )
    // `);

    // Example: Create an index
    // await db.execute(`
    //   CREATE INDEX idx_name
    //   ON table_name(column_name)
    // `);

    // Example: Update existing data
    // await db.execute(`
    //   UPDATE table_name
    //   SET new_column = 'default_value'
    //   WHERE condition = true
    // `);

    throw new Error(
      "Migration not implemented - replace this with your schema changes"
    );
  },

  /**
   * Rollback the migration (optional)
   * This is only used in development for testing
   * Not required for production migrations
   */
  async down() {
    // Example: Remove a column (requires table recreation in SQLite)
    // Example: Drop a table
    // await db.execute(`DROP TABLE IF EXISTS new_table`);

    // Example: Drop an index
    // await db.execute(`DROP INDEX IF EXISTS idx_name`);

    throw new Error("Rollback not implemented");
  },
};
