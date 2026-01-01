import { Migration } from "../migrations";
import { db } from "../db";

export const migration_004: Migration = {
  version: 4,
  name: "update_workouts",

  async up() {
    // 3. Update workout_plans
    await db.execute(`
      UPDATE workout_plans
      SET user_id = 1;
    `);
  },

  async down() {
    await db.execute(`
      UPDATE workout_plans
      SET user_id = NULL;
    `);
  },
};
