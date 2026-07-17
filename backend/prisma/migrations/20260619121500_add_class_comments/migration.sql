CREATE TABLE "ClassComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "classId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassComment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ClassComment_classId_pinned_createdAt_idx" ON "ClassComment"("classId", "pinned", "createdAt");

CREATE INDEX "ClassComment_parentId_createdAt_idx" ON "ClassComment"("parentId", "createdAt");

ALTER TABLE "ClassComment" ADD CONSTRAINT "ClassComment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClassComment" ADD CONSTRAINT "ClassComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClassComment" ADD CONSTRAINT "ClassComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ClassComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
