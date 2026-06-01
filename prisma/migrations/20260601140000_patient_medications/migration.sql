CREATE TABLE IF NOT EXISTS "PatientMedication" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dose" TEXT NOT NULL DEFAULT '',
    "timing" TEXT NOT NULL DEFAULT '',
    "prescribedBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientMedication_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PatientMedication_patientId_idx" ON "PatientMedication"("patientId");
CREATE INDEX IF NOT EXISTS "PatientMedication_status_idx" ON "PatientMedication"("status");

ALTER TABLE "PatientMedication" ADD CONSTRAINT "PatientMedication_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
