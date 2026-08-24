/**
 * Rotate an administrator's password.
 *
 * Removing the demo credentials from the repository does not change the
 * database. Any account seeded with the old published password is still
 * reachable with it until this is run. That is the whole point of this script.
 *
 * It also fixes the roles: passing --demote turns every other admin account
 * into a client, which is how you clear out an admin someone else created.
 *
 *   ADMIN_EMAIL="you@example.com" ADMIN_PASSWORD="<long random>" \
 *     npx tsx prisma/set-admin-password.ts
 *
 *   # against production
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... \
 *     npx prisma generate --schema=prisma/schema.postgres.prisma && \
 *     npx tsx prisma/set-admin-password.ts
 *
 * Generate a password with:  openssl rand -base64 24
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const email = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
const password = process.env.ADMIN_PASSWORD ?? "";
const demote = process.argv.includes("--demote");

async function main() {
  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in the environment.");
  }
  if (password.length < 16) {
    throw new Error("ADMIN_PASSWORD must be at least 16 characters. Try: openssl rand -base64 24");
  }

  const host = (process.env.DATABASE_URL ?? "").match(/@([^/?:]+)/)?.[1] ?? "local database";
  console.log(`Setting admin password for ${email} on ${host}`);

  const passwordHash = await bcrypt.hash(password, 12);

  await db.user.upsert({
    where: { email },
    update: { passwordHash, role: "admin" },
    create: { email, name: "Kennel Admin", role: "admin", passwordHash },
  });
  console.log("✔ password set and role confirmed as admin");

  // Any outstanding email sign-in codes are invalidated: if the old password
  // leaked, an outstanding code may have too.
  const { count: codes } = await db.loginCode.updateMany({
    where: { consumed: false },
    data: { consumed: true },
  });
  if (codes) console.log(`✔ invalidated ${codes} outstanding sign-in code(s)`);

  const others = await db.user.findMany({
    where: { role: "admin", email: { not: email } },
    select: { email: true },
  });

  if (others.length === 0) {
    console.log("✔ no other admin accounts exist");
  } else if (demote) {
    await db.user.updateMany({ where: { role: "admin", email: { not: email } }, data: { role: "client" } });
    console.log(`✔ demoted ${others.length} other admin account(s): ${others.map((o) => o.email).join(", ")}`);
  } else {
    console.warn(
      `\n⚠ ${others.length} other account(s) still hold the admin role:\n` +
        others.map((o) => `    ${o.email}`).join("\n") +
        "\n  Re-run with --demote to strip them.\n"
    );
  }
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
