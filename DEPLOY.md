# Deployment Guide for SelamGPT

## Troubleshooting Vercel Deployment

If you encounter a **500 Internal Server Error** with the code `FUNCTION_INVOCATION_FAILED` when deploying to Vercel, it is likely due to missing database configuration.

This application uses **NuxtHub** with a **SQLite** database.

### The Issue

By default, NuxtHub attempts to connect to a persistent database. On Vercel, serverless functions do not have a persistent filesystem for SQLite files. Therefore, you must use a remote SQLite database like **Turso** (via LibSQL) or switch to Vercel Postgres.

### Solution 1: Connect to Turso (Recommended for SQLite)

To keep the current SQLite configuration (`hub: { db: 'sqlite' }`):

1.  **Create a Turso Database:**
    *   Sign up at [Turso.tech](https://turso.tech).
    *   Create a new database.
2.  **Get Credentials:**
    *   Get your Database URL (e.g., `libsql://...` or `https://...`).
    *   Get your Authentication Token.
3.  **Configure Vercel Environment Variables:**
    *   Go to your Vercel Project Settings > Environment Variables.
    *   Add the following variables:
        *   `NUXT_HUB_PROJECT_URL`: Your Turso Database URL (or Hub URL if using NuxtHub managed).
        *   **OR** (if using standard LibSQL client):
            *   `TURSO_DATABASE_URL`: Your Turso Database URL.
            *   `TURSO_AUTH_TOKEN`: Your Turso Auth Token.

### Solution 2: Switch to Vercel Postgres

If you prefer to use Vercel's native Postgres:

1.  **Update Configuration:**
    *   In `nuxt.config.ts`, change `hub: { db: 'sqlite' }` to `hub: { db: 'postgres' }`.
2.  **Update Schema:**
    *   In `server/db/schema.ts`, you must change the imports from `drizzle-orm/sqlite-core` to `drizzle-orm/pg-core` and update column definitions (e.g., `text`, `integer`, `serial`).
3.  **Link Database:**
    *   In Vercel, go to Storage > Postgres and create a database.
    *   Link it to your project. Vercel will automatically add `POSTGRES_URL`, etc.

### Solution 3: NuxtHub Managed (Zero Config)

If you linked this project to a NuxtHub account:
1.  Run `npx nuxthub link` locally to link your project.
2.  Deploying should automatically provision resources if you are using NuxtHub's deployment flow (Cloudflare workers usually).
3.  For Vercel, you still need to ensure the `NUXT_HUB_...` variables are present if you are connecting to a NuxtHub-managed instance.

## Summary

The "Function Invocation Failed" is because the app cannot find a writable database. **Adding Turso credentials to your Vercel Environment Variables is the fastest fix.**
