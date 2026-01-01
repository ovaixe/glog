#!/usr/bin/env node

/**
 * Migration CLI Tool
 *
 * Usage:
 *   npm run migrate          - Run all pending migrations
 *   npm run migrate:status   - Show migration status
 *   npm run migrate:rollback - Rollback last migration (dev only)
 */

import { runMigrations, rollbackLastMigration } from "../lib/migrations";
import { allMigrations } from "../lib/migrations/index";
import db from "../lib/db";

async function getMigrationStatus() {
  // Create migrations table if it doesn't exist
  await db.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const result = await db.execute(
    "SELECT version, name, applied_at FROM schema_migrations ORDER BY version"
  );

  console.log("\n📊 Migration Status\n");
  console.log("Applied Migrations:");
  console.log("─".repeat(80));

  if (result.rows.length === 0) {
    console.log("No migrations applied yet");
  } else {
    result.rows.forEach((row: any) => {
      console.log(
        `✅ Version ${row.version}: ${row.name} (applied: ${row.applied_at})`
      );
    });
  }

  console.log("\n" + "─".repeat(80));
  console.log("\nPending Migrations:");
  console.log("─".repeat(80));

  const appliedVersions = result.rows.map((row: any) => row.version as number);
  const pendingMigrations = allMigrations.filter(
    (m) => !appliedVersions.includes(m.version)
  );

  if (pendingMigrations.length === 0) {
    console.log("No pending migrations");
  } else {
    pendingMigrations.forEach((m) => {
      console.log(`⏳ Version ${m.version}: ${m.name}`);
    });
  }

  console.log("\n" + "─".repeat(80));
  console.log(
    `\nTotal: ${result.rows.length} applied, ${pendingMigrations.length} pending\n`
  );
}

async function main() {
  const command = process.argv[2] || "run";

  try {
    switch (command) {
      case "run":
      case "up":
        await runMigrations(allMigrations);
        break;

      case "status":
        await getMigrationStatus();
        break;

      case "rollback":
      case "down":
        console.log(
          "⚠️  WARNING: Rollback should only be used in development!"
        );
        await rollbackLastMigration(allMigrations);
        break;

      default:
        console.log("Unknown command:", command);
        console.log("\nAvailable commands:");
        console.log("  run, up       - Run all pending migrations");
        console.log("  status        - Show migration status");
        console.log("  rollback, down - Rollback last migration (dev only)");
        process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error("Migration command failed:", error);
    process.exit(1);
  }
}

main();
