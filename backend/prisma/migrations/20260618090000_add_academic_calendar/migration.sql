CREATE TYPE "EventType" AS ENUM (
  'HOLIDAY',
  'EXAM',
  'EVENT',
  'ASSIGNMENT',
  'MEETING',
  'ANNOUNCEMENT',
  'TEST',
  'QUIZ'
);

CREATE TYPE "EventScope" AS ENUM (
  'SCHOOL',
  'CLASS',
  'TEACHER'
);

ALTER TABLE "TeacherPermission"
ADD COLUMN "canManageCalendar" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "CalendarEvent" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "eventType" "EventType" NOT NULL,
  "scope" "EventScope" NOT NULL DEFAULT 'SCHOOL',
  "schoolId" TEXT,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CalendarEventClass" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "classId" TEXT NOT NULL,

  CONSTRAINT "CalendarEventClass_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CalendarEvent_schoolId_startDate_idx"
ON "CalendarEvent"("schoolId", "startDate");

CREATE UNIQUE INDEX "CalendarEventClass_eventId_classId_key"
ON "CalendarEventClass"("eventId", "classId");

CREATE INDEX "CalendarEventClass_classId_idx"
ON "CalendarEventClass"("classId");

ALTER TABLE "CalendarEvent"
ADD CONSTRAINT "CalendarEvent_schoolId_fkey"
FOREIGN KEY ("schoolId") REFERENCES "School"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CalendarEventClass"
ADD CONSTRAINT "CalendarEventClass_eventId_fkey"
FOREIGN KEY ("eventId") REFERENCES "CalendarEvent"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CalendarEventClass"
ADD CONSTRAINT "CalendarEventClass_classId_fkey"
FOREIGN KEY ("classId") REFERENCES "Class"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
