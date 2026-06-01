CREATE TABLE IF NOT EXISTS "MedicationRefill" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "medications" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "notes" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicationRefill_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "MedicationRefill_patientId_idx" ON "MedicationRefill"("patientId");
CREATE INDEX IF NOT EXISTS "MedicationRefill_status_idx" ON "MedicationRefill"("status");

ALTER TABLE "MedicationRefill" ADD CONSTRAINT "MedicationRefill_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
