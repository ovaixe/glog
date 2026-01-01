import { Migration } from "../migrations";
import db from "../db";

export const migration_004: Migration = {
  version: 4,
  name: "update_workout_plans",

  async up() {
    // Check if user 1 exists, if not create it to solve FK constraint
    const userCheck = await db.execute("SELECT id FROM users WHERE id = 1");

    if (userCheck.rows.length === 0) {
      // Create a default user to own the legacy plans
      // Uses a placeholder hash so no one can login as this user unless manually updated
      await db.execute({
        sql: "INSERT INTO users (id, username, password_hash) VALUES (1, ?, ?)",
        args: ["legacy_user", "$2a$10$legacyuserplaceholderhashvalue"],
      });
    }

    // Update workout_plans
    await db.execute(`
      UPDATE workout_plans
      SET user_id = 1
      WHERE user_id IS NULL;
    `);
  },

  async down() {
    await db.execute(`
      UPDATE workout_plans
      SET user_id = NULL;
    `);
  },
};
