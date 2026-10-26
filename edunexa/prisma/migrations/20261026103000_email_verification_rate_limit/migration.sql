ALTER TABLE "VerificationToken"
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "VerificationToken_identifier_createdAt_idx"
ON "VerificationToken"("identifier", "createdAt");

-- Existing accounts were created before email verification was required.
UPDATE "User"
SET "emailVerified" = CURRENT_TIMESTAMP
WHERE "emailVerified" IS NULL;
