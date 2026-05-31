-- Patient-editable profile details
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "allergies" TEXT;
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "emergencyContactName" TEXT;
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "emergencyContactRelation" TEXT;
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "emergencyContactPhone" TEXT;
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "insuranceProvider" TEXT;
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "insuranceNumber" TEXT;
