import { Migration } from "../migrations";
import { db } from "../db";

export const migration_005: Migration = {
  version: 5,
  name: "update_workout_history",

  async up() {
    // 3. Update workout_plans
    await db.execute(`
      UPDATE workout_history
      SET user_id = 1;
    `);
  },

  async down() {
    await db.execute(`
      UPDATE workout_history
      SET user_id = NULL;
    `);
  },
};
