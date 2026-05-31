-- Patient profile photo (base64 data URL)
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "avatar" TEXT;
