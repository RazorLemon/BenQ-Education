import prisma from "../prismaClient.js";

const enrollmentDupes =
 await prisma.$queryRawUnsafe(
  `SELECT "classId", "studentId", COUNT(*)::int AS count
   FROM "Enrollment"
   GROUP BY "classId", "studentId"
   HAVING COUNT(*) > 1`
 );

const submissionDupes =
 await prisma.$queryRawUnsafe(
  `SELECT "assignmentId", "studentId", COUNT(*)::int AS count
   FROM "Submission"
   GROUP BY "assignmentId", "studentId"
   HAVING COUNT(*) > 1`
 );

console.log(
 JSON.stringify(
  {
   enrollmentDupes,
   submissionDupes
  },
  null,
  2
 )
);

await prisma.$disconnect();
