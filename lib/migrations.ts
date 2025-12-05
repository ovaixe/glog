import { db } from "./db";

export interface Migration {
  version: number;
  name: string;
  up: () => Promise<void>;
  down?: () => Promise<void>;
}

/**
 * Migration tracking table
 */
async function createMigrationsTable() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

/**
 * Get all applied migration versions
 */
async function getAppliedMigrations(): Promise<number[]> {
  const result = await db.execute(
    "SELECT version FROM schema_migrations ORDER BY version"
  );
  return result.rows.map((row) => row.version as number);
}

/**
 * Mark a migration as applied
 */
async function markMigrationApplied(
  version: number,
  name: string
): Promise<void> {
  await db.execute({
    sql: "INSERT INTO schema_migrations (version, name) VALUES (?, ?)",
    args: [version, name],
  });
}

/**
 * Run all pending migrations
 */
export async function runMigrations(migrations: Migration[]): Promise<void> {
  console.log("🔄 Starting database migrations...");

  // Ensure migrations table exists
  await createMigrationsTable();

  // Get applied migrations
  const appliedVersions = await getAppliedMigrations();
  console.log(`📊 Applied migrations: ${appliedVersions.join(", ") || "none"}`);

  // Sort migrations by version
  const sortedMigrations = [...migrations].sort(
    (a, b) => a.version - b.version
  );

  // Run pending migrations
  let appliedCount = 0;
  for (const migration of sortedMigrations) {
    if (!appliedVersions.includes(migration.version)) {
      console.log(
        `⬆️  Applying migration ${migration.version}: ${migration.name}`
      );
      try {
        await migration.up();
        await markMigrationApplied(migration.version, migration.name);
        appliedCount++;
        console.log(`✅ Migration ${migration.version} applied successfully`);
      } catch (error) {
        console.error(
          `❌ Failed to apply migration ${migration.version}: ${migration.name}`,
          error
        );
        throw error;
      }
    }
  }

  if (appliedCount === 0) {
    console.log("✨ Database is up to date");
  } else {
    console.log(`✅ Applied ${appliedCount} migration(s)`);
  }
}

/**
 * Rollback the last migration (use with caution in production)
 */
export async function rollbackLastMigration(
  migrations: Migration[]
): Promise<void> {
  await createMigrationsTable();

  const appliedVersions = await getAppliedMigrations();
  if (appliedVersions.length === 0) {
    console.log("No migrations to rollback");
    return;
  }

  const lastVersion = appliedVersions[appliedVersions.length - 1];
  const migration = migrations.find((m) => m.version === lastVersion);

  if (!migration) {
    throw new Error(`Migration ${lastVersion} not found`);
  }

  if (!migration.down) {
    throw new Error(`Migration ${lastVersion} has no down() function`);
  }

  console.log(
    `⬇️  Rolling back migration ${migration.version}: ${migration.name}`
  );
  await migration.down();
  await db.execute({
    sql: "DELETE FROM schema_migrations WHERE version = ?",
    args: [lastVersion],
  });
  console.log(`✅ Migration ${migration.version} rolled back successfully`);
}
