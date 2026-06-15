-- User.status exists in Prisma schema but was never migrated; breaks register/login in production.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active';
