CREATE TABLE "SchoolSetting" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "saturdayOff" BOOLEAN NOT NULL DEFAULT true,
    "calendarDefaultView" TEXT NOT NULL DEFAULT 'week',
    "cacheEnabled" BOOLEAN NOT NULL DEFAULT true,
    "cacheTtlSeconds" INTEGER NOT NULL DEFAULT 60,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolSetting_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SchoolSetting_schoolId_key" ON "SchoolSetting"("schoolId");

ALTER TABLE "SchoolSetting" ADD CONSTRAINT "SchoolSetting_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
