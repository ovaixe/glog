import { Migration } from "../migrations";
import { migration_001 } from "./001_initial_schema";
import { migration_002 } from "./002_add_duration_seconds_to_workout_history";
import { migration_003 } from "./003_add_users_table";
import { migration_004 } from "./004_update_workout_plans";
import { migration_005 } from "./005_update_workout_history";

/**
 * All migrations in order
 * Add new migrations to this array as you create them
 */
export const allMigrations: Migration[] = [
  migration_001,
  migration_002,
  migration_003,
  migration_004,
  migration_005,
];
