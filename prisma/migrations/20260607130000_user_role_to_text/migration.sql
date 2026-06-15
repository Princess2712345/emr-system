-- Prisma schema declares User.role as String, but production DB still uses enum "Role".
-- Convert the column to TEXT so register/login writes like "ADMIN" succeed.
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE TEXT USING ("role"::text);
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'PATIENT';

DROP TYPE IF EXISTS "Role";
