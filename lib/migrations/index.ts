import { Migration } from "../migrations";
import { migration_001 } from "./001_initial_schema";
import { migration_002 } from "./002_add_duration_seconds_to_workout_history";

/**
 * All migrations in order
 * Add new migrations to this array as you create them
 */
export const allMigrations: Migration[] = [migration_001, migration_002];
