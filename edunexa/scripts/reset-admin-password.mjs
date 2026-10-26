import "dotenv/config";
import bcrypt from "bcryptjs";
import pg from "pg";

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error("Usage: npm run reset:admin-password -- <admin-account-email>");
  process.exit(1);
}

function readHidden(prompt) {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
    throw new Error("Run this command in an interactive terminal so the password can be entered privately.");
  }

  return new Promise((resolve, reject) => {
    const input = process.stdin;
    let value = "";
    process.stdout.write(prompt);
    input.setRawMode(true);
    input.resume();
    input.setEncoding("utf8");

    function finish(error) {
      input.setRawMode(false);
      input.pause();
      input.removeListener("data", onData);
      process.stdout.write("\n");
      if (error) reject(error);
      else resolve(value);
    }

    function onData(chunk) {
      for (const key of chunk) {
        if (key === "\u0003") return finish(new Error("Password reset cancelled."));
        if (key === "\r" || key === "\n") return finish();
        if (key === "\u0008" || key === "\u007f") {
          value = value.slice(0, -1);
          process.stdout.write("\b \b");
          continue;
        }
        if (key >= " ") {
          value += key;
          process.stdout.write("*");
        }
      }
    }

    input.on("data", onData);
  });
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

try {
  const password = await readHidden("New password (minimum 8 characters): ");
  if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("Password must be at least 8 characters and no more than 72 bytes.");
  }

  const confirmation = await readHidden("Confirm new password: ");
  if (password !== confirmation) throw new Error("Passwords do not match.");

  await client.connect();
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await client.query(
    'UPDATE "User" SET "password" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE LOWER("email") = $2 AND "role" = \'ADMIN\'::"Role"',
    [passwordHash, email]
  );

  if (result.rowCount !== 1) {
    throw new Error("No administrator account matched that email; no password was changed.");
  }

  console.log("Admin password updated. Sign in with the new password.");
} catch (error) {
  console.error(error.message || "Admin password reset failed.");
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
