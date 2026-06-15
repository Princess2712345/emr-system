-- Prisma schema uses Appointment.staffId -> User, but production DB still has doctorId -> Doctor.
ALTER TABLE "Appointment" DROP CONSTRAINT IF EXISTS "Appointment_doctorId_fkey";

ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "staffId" TEXT;

ALTER TABLE "Appointment" DROP COLUMN IF EXISTS "doctorId";

DROP INDEX IF EXISTS "Appointment_doctorId_idx";
CREATE INDEX IF NOT EXISTS "Appointment_staffId_idx" ON "Appointment"("staffId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Appointment_staffId_fkey'
  ) THEN
    ALTER TABLE "Appointment"
      ADD CONSTRAINT "Appointment_staffId_fkey"
      FOREIGN KEY ("staffId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DROP TABLE IF EXISTS "Doctor";
