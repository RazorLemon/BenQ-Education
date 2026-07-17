CREATE TABLE "ActivityLog" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT,
  "action" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "actorRole" TEXT,
  "actorId" TEXT,
  "studentId" TEXT,
  "studentName" TEXT,
  "rollNumber" TEXT,
  "classId" TEXT,
  "classSection" TEXT,
  "subject" TEXT,
  "assignmentId" TEXT,
  "assignmentTitle" TEXT,
  "fileName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ActivityLog_schoolId_action_createdAt_idx"
ON "ActivityLog"("schoolId", "action", "createdAt");

CREATE INDEX "ActivityLog_classId_createdAt_idx"
ON "ActivityLog"("classId", "createdAt");

CREATE INDEX "ActivityLog_studentId_createdAt_idx"
ON "ActivityLog"("studentId", "createdAt");

ALTER TABLE "ActivityLog"
ADD CONSTRAINT "ActivityLog_schoolId_fkey"
FOREIGN KEY ("schoolId") REFERENCES "School"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "ActivityLog" (
  "id",
  "schoolId",
  "action",
  "message",
  "actorRole",
  "studentId",
  "studentName",
  "rollNumber",
  "classId",
  "classSection",
  "subject",
  "assignmentId",
  "assignmentTitle",
  "fileName",
  "createdAt"
)
SELECT
  'backfill-submission-' || s."id",
  c."schoolId",
  'ASSIGNMENT_SUBMITTED',
  u."name" || ' submitted ' || a."title",
  'STUDENT',
  st."id",
  u."name",
  st."rollNumber",
  c."id",
  c."name",
  c."subject",
  a."id",
  a."title",
  s."fileName",
  COALESCE(s."submittedAt", s."createdAt")
FROM "Submission" s
JOIN "Assignment" a ON a."id" = s."assignmentId"
JOIN "Class" c ON c."id" = a."classId"
JOIN "Student" st ON st."id" = s."studentId"
JOIN "User" u ON u."id" = st."userId";
