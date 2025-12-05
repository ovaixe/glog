# Database Migrations - Quick Reference

## 🚀 Quick Start

### Check Migration Status

```bash
npm run migrate:status
```

### Run Pending Migrations

```bash
npm run migrate
```

### Rollback Last Migration (Dev Only)

```bash
npm run migrate:rollback
```

## 📝 Creating a New Migration

### Step 1: Create Migration File

Create `lib/migrations/XXX_description.ts` where XXX is the next number:

```typescript
import { Migration } from "../migrations";
import { db } from "../db";

export const migration_002: Migration = {
  version: 2,
  name: "add_field_to_table",

  async up() {
    await db.execute(`
      ALTER TABLE table_name 
      ADD COLUMN new_field TEXT
    `);
  },
};
```

### Step 2: Register Migration

Add to `lib/migrations/index.ts`:

```typescript
import { migration_001 } from "./001_initial_schema";
import { migration_002 } from "./002_add_field_to_table";

export const allMigrations: Migration[] = [
  migration_001,
  migration_002, // Add here
];
```

### Step 3: Run Migration

```bash
npm run migrate
```

## 📋 Common Patterns

### Add Column

```typescript
await db.execute(`
  ALTER TABLE workout_history 
  ADD COLUMN notes TEXT
`);
```

### Create Table

```typescript
await db.execute(`
  CREATE TABLE new_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
```

### Create Index

```typescript
await db.execute(`
  CREATE INDEX idx_name 
  ON table_name(column_name)
`);
```

### Update Data

```typescript
await db.execute(`
  UPDATE table_name 
  SET new_column = 'default_value'
  WHERE condition = true
`);
```

## ⚠️ SQLite Limitations

SQLite **cannot**:

- DROP COLUMN
- ALTER COLUMN type
- Add FOREIGN KEY to existing table

For these, you need to recreate the table:

```typescript
async up() {
  // 1. Create new table with updated schema
  await db.execute(`
    CREATE TABLE table_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      field1 TEXT,
      new_field TEXT  -- New column
    )
  `);

  // 2. Copy data
  await db.execute(`
    INSERT INTO table_new (id, field1)
    SELECT id, field1 FROM table_old
  `);

  // 3. Drop old table
  await db.execute(`DROP TABLE table_old`);

  // 4. Rename new table
  await db.execute(`
    ALTER TABLE table_new RENAME TO table_old
  `);

  // 5. Recreate indexes
  await db.execute(`
    CREATE INDEX idx_name ON table_old(field1)
  `);
}
```

## 🔄 How It Works

1. **Automatic**: Migrations run on server startup
2. **Tracked**: `schema_migrations` table tracks applied migrations
3. **Safe**: Server exits if migration fails
4. **Idempotent**: Each migration runs only once

## 🛠️ Troubleshooting

### Migration Failed

1. Check error logs
2. Fix the migration file
3. Delete from tracking table:
   ```sql
   DELETE FROM schema_migrations WHERE version = X;
   ```
4. Run migration again

### Check Database Schema

```bash
sqlite3 workout.db ".schema"
```

### View Applied Migrations

```bash
sqlite3 workout.db "SELECT * FROM schema_migrations ORDER BY version;"
```

## 📦 Production Deployment

Migrations run automatically when:

- `npm run dev` (development)
- `npm run build && npm start` (production)

**Best Practices:**

1. ✅ Test migrations locally first
2. ✅ Backup production database before deploying
3. ✅ Monitor logs during deployment
4. ✅ Have rollback plan ready
5. ✅ Never modify existing migrations
6. ✅ Keep migrations small and focused

## 📚 Full Documentation

See [MIGRATIONS_GUIDE.md](MIGRATIONS_GUIDE.md) for complete documentation.
