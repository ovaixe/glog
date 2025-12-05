# Database Migrations Guide

This project uses a custom migration system to manage database schema changes in a production-safe way.

## Overview

- **Migration files** are located in `lib/migrations/`
- **Migrations run automatically** on server startup (both dev and production)
- **Migration tracking** ensures each migration runs only once
- **Version control** prevents out-of-order execution

## How It Works

1. Migrations are tracked in a `schema_migrations` table
2. On startup, the system checks which migrations have been applied
3. Pending migrations are executed in order
4. Each successful migration is recorded to prevent re-execution

## Creating a New Migration

### Step 1: Create the Migration File

Create a new file in `lib/migrations/` with the naming convention:

```
XXX_description.ts
```

Where `XXX` is the next sequential number (e.g., `002`, `003`, etc.)

### Step 2: Define the Migration

Use this template:

```typescript
import { Migration } from "../migrations";
import { db } from "../db";

export const migration_XXX: Migration = {
  version: XXX, // Must match filename number
  name: "description_of_change",

  async up() {
    // Add your schema changes here
    await db.execute(`
      ALTER TABLE workout_history 
      ADD COLUMN new_field TEXT
    `);
  },

  async down() {
    // Optional: Define how to rollback this migration
    // Only needed for development/testing
    await db.execute(`
      ALTER TABLE workout_history 
      DROP COLUMN new_field
    `);
  },
};
```

### Step 3: Register the Migration

Add your migration to `lib/migrations/index.ts`:

```typescript
import { migration_001 } from "./001_initial_schema";
import { migration_002 } from "./002_your_new_migration";

export const allMigrations: Migration[] = [
  migration_001,
  migration_002, // Add here
];
```

## Example: Adding a Column to workout_history

Let's say you need to add a `workout_name` column to the `workout_history` table:

**File: `lib/migrations/002_add_workout_name.ts`**

```typescript
import { Migration } from "../migrations";
import { db } from "../db";

export const migration_002: Migration = {
  version: 2,
  name: "add_workout_name_to_history",

  async up() {
    // Add the new column
    await db.execute(`
      ALTER TABLE workout_history 
      ADD COLUMN workout_name TEXT
    `);

    // Optionally backfill data
    await db.execute(`
      UPDATE workout_history 
      SET workout_name = (
        SELECT name FROM workout_plans 
        WHERE workout_plans.id = workout_history.workout_plan_id
      )
    `);
  },

  async down() {
    // SQLite doesn't support DROP COLUMN easily
    // You'd need to recreate the table without the column
    // For production, down() is often not needed
  },
};
```

Then register it in `lib/migrations/index.ts`.

## Common Migration Patterns

### Adding a Column

```typescript
await db.execute(`
  ALTER TABLE table_name 
  ADD COLUMN column_name TYPE DEFAULT value
`);
```

### Creating a New Table

```typescript
await db.execute(`
  CREATE TABLE new_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
```

### Creating an Index

```typescript
await db.execute(`
  CREATE INDEX idx_name 
  ON table_name(column_name)
`);
```

### Data Migration

```typescript
// Update existing data
await db.execute(`
  UPDATE table_name 
  SET new_column = old_column * 2
  WHERE condition = true
`);
```

## SQLite Limitations

SQLite has some limitations compared to other databases:

- **Cannot DROP COLUMN** (requires table recreation)
- **Cannot ALTER COLUMN** type (requires table recreation)
- **Cannot add FOREIGN KEY** to existing table

For these cases, you need to:

1. Create a new table with the desired schema
2. Copy data from the old table
3. Drop the old table
4. Rename the new table

Example:

```typescript
async up() {
  // Create new table with updated schema
  await db.execute(`
    CREATE TABLE workout_history_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_plan_id INTEGER NOT NULL,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      exercises_data TEXT NOT NULL,
      duration_seconds INTEGER,
      new_column TEXT, -- New column
      FOREIGN KEY (workout_plan_id) REFERENCES workout_plans(id)
    )
  `);

  // Copy existing data
  await db.execute(`
    INSERT INTO workout_history_new
      (id, workout_plan_id, completed_at, exercises_data, duration_seconds)
    SELECT id, workout_plan_id, completed_at, exercises_data, duration_seconds
    FROM workout_history
  `);

  // Drop old table
  await db.execute(`DROP TABLE workout_history`);

  // Rename new table
  await db.execute(`
    ALTER TABLE workout_history_new
    RENAME TO workout_history
  `);

  // Recreate indexes
  await db.execute(`
    CREATE INDEX idx_history_completed
    ON workout_history(completed_at DESC)
  `);
}
```

## Production Deployment

### Automatic Migration on Startup

Migrations run automatically when the server starts:

- **Development**: `npm run dev`
- **Production**: `npm run build && npm start`

The migration system will:

1. Check for pending migrations
2. Apply them in order
3. Log the results
4. Exit with error if any migration fails

### Migration Logs

You'll see output like:

```
🔄 Starting database migrations...
📊 Applied migrations: 1
⬆️  Applying migration 2: add_workout_name_to_history
✅ Migration 2 applied successfully
✅ Applied 1 migration(s)
```

### Safety Features

- **Idempotent**: Migrations only run once
- **Ordered**: Migrations execute in version order
- **Atomic**: Each migration is a separate transaction
- **Fail-safe**: Server exits if migration fails (prevents running with wrong schema)

## Testing Migrations

### Local Testing

1. **Backup your database**:

   ```bash
   cp workout.db workout.db.backup
   ```

2. **Run the migration**:

   ```bash
   npm run dev
   ```

3. **Verify the changes**:

   ```bash
   sqlite3 workout.db ".schema"
   ```

4. **If something goes wrong**:
   ```bash
   cp workout.db.backup workout.db
   ```

### Production Testing

1. Test migrations on a staging environment first
2. Backup production database before deploying
3. Monitor logs during deployment
4. Have a rollback plan ready

## Rollback (Development Only)

For development, you can rollback the last migration:

```typescript
import { rollbackLastMigration } from "./lib/migrations";
import { allMigrations } from "./lib/migrations/index";

// In a script or REPL
await rollbackLastMigration(allMigrations);
```

**Note**: Rollbacks require the `down()` function to be implemented.

## Best Practices

1. **Never modify existing migrations** - Create new ones instead
2. **Test migrations locally** before deploying
3. **Keep migrations small** - One logical change per migration
4. **Use descriptive names** - Make it clear what the migration does
5. **Add comments** - Explain complex migrations
6. **Backup before deploying** - Always have a recovery plan
7. **Version control** - Commit migrations with your code changes

## Troubleshooting

### Migration Failed

If a migration fails:

1. Check the error logs
2. Fix the migration file
3. Delete the failed migration from `schema_migrations` table:
   ```sql
   DELETE FROM schema_migrations WHERE version = X;
   ```
4. Restart the server

### Migration Already Applied

If you need to re-run a migration:

```sql
DELETE FROM schema_migrations WHERE version = X;
```

Then restart the server.

### Check Applied Migrations

```sql
SELECT * FROM schema_migrations ORDER BY version;
```

## Example Workflow

Let's say you need to add a `notes` field to workout history:

1. **Create migration file**: `lib/migrations/002_add_notes_to_history.ts`
2. **Write the migration**:
   ```typescript
   export const migration_002: Migration = {
     version: 2,
     name: "add_notes_to_history",
     async up() {
       await db.execute(`
         ALTER TABLE workout_history 
         ADD COLUMN notes TEXT
       `);
     },
   };
   ```
3. **Register it**: Add to `lib/migrations/index.ts`
4. **Update TypeScript types**: Update `WorkoutHistory` interface in `lib/db.ts`
5. **Test locally**: Run `npm run dev`
6. **Commit**: Git commit the migration with your code changes
7. **Deploy**: Push to production, migration runs automatically

---

## Summary

This migration system provides:

- ✅ Automatic execution on startup
- ✅ Version tracking
- ✅ Production-safe deployment
- ✅ Easy to use and maintain
- ✅ Works with both local SQLite and Turso

For questions or issues, refer to this guide or check the migration system code in `lib/migrations.ts`.
