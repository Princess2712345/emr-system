ALTER TABLE "LabResult" ADD COLUMN IF NOT EXISTS "findings" TEXT;
ALTER TABLE "LabResult" ADD COLUMN IF NOT EXISTS "interpretation" TEXT;
ALTER TABLE "LabResult" ADD COLUMN IF NOT EXISTS "resultDetails" JSONB;

CREATE INDEX IF NOT EXISTS "LabResult_patientId_idx" ON "LabResult"("patientId");
