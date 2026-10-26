-- Keep the current access role at STUDENT until an administrator approves the request.
ALTER TABLE "User" ADD COLUMN "requestedRole" "Role";

CREATE INDEX "User_requestedRole_idx" ON "User"("requestedRole");
