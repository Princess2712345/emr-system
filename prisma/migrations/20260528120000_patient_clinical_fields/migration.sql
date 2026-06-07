-- Patient clinical profile fields for registration directory
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "gender" TEXT;
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "birthDate" TIMESTAMP(3);
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active';
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "Patient_status_idx" ON "Patient"("status");
CREATE INDEX IF NOT EXISTS "Patient_createdAt_idx" ON "Patient"("createdAt");
