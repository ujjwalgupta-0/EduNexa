import "dotenv/config";
import pg from "pg";

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error("Usage: npm run bootstrap:admin -- <existing-account-email>");
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

try {
  await client.connect();
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(930271, 5512)");

  const adminCount = await client.query('SELECT COUNT(*)::int AS count FROM "User" WHERE "role" = \'ADMIN\'');
  if (adminCount.rows[0].count > 0) {
    throw new Error("An administrator already exists; bootstrap is limited to the first administrator.");
  }

  const account = await client.query(
    'SELECT id FROM "User" WHERE LOWER(email) = $1 FOR UPDATE',
    [email]
  );

  if (account.rowCount !== 1) {
    throw new Error("No existing account matched that email.");
  }

  await client.query(
    'UPDATE "User" SET "role" = \'ADMIN\'::"Role", "requestedRole" = NULL, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $1',
    [account.rows[0].id]
  );
  await client.query("COMMIT");
  console.log("The existing account was promoted to the first administrator.");
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  console.error(error.message || "Administrator bootstrap failed.");
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
