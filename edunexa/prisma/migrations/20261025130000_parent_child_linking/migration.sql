CREATE TABLE "ParentLinkInvitation" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "parentEmail" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "acceptedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentLinkInvitation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ParentChild" (
    "parentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentChild_pkey" PRIMARY KEY ("parentId", "studentId")
);

CREATE UNIQUE INDEX "ParentLinkInvitation_tokenHash_key" ON "ParentLinkInvitation"("tokenHash");
CREATE INDEX "ParentLinkInvitation_studentId_parentEmail_idx" ON "ParentLinkInvitation"("studentId", "parentEmail");
CREATE INDEX "ParentLinkInvitation_expiresAt_idx" ON "ParentLinkInvitation"("expiresAt");
CREATE INDEX "ParentChild_studentId_idx" ON "ParentChild"("studentId");

ALTER TABLE "ParentLinkInvitation" ADD CONSTRAINT "ParentLinkInvitation_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ParentLinkInvitation" ADD CONSTRAINT "ParentLinkInvitation_acceptedById_fkey"
    FOREIGN KEY ("acceptedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ParentChild" ADD CONSTRAINT "ParentChild_parentId_fkey"
    FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ParentChild" ADD CONSTRAINT "ParentChild_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
