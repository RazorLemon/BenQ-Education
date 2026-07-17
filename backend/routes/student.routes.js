import express from "express";

import {
  getStudentProfile,
  getStudentClasses,
  getStudentAssignments,
  getStudentAnnouncements,
  submitAssignment,
  deleteSubmission,
  getStudentSubmissions,
  getStudentAnalytics,
  getStudentDashboard,
  getStudentClassDetails
}
from "../controllers/student.controller.js";

import {
 getStudentCalendar
}
from "../controllers/calendar.controller.js";

import {
 getSettings
}
from "../controllers/settings.controller.js";

import {
 listStudentClassComments,
 createStudentClassComment
}
from "../controllers/classComment.controller.js";

import {
  requireAuth
}
from "../middleware/auth.middleware.js";

import {
 requireStudent
}
from "../middleware/role.middleware.js";

import {
 validateBody
}
from "../middleware/validate.middleware.js";

import {
 cacheResponse
}
from "../middleware/cache.middleware.js";

import {
 submitAssignmentSchema,
 classCommentSchema
}
from "../validation/schemas.js";



const router = express.Router();

const studentCache =
 cacheResponse({
  namespace: "student"
 });

router.get(
 "/dashboard",
 requireAuth,
 requireStudent,
 studentCache,
 getStudentDashboard
);

router.get(
 "/calendar",
 requireAuth,
 requireStudent,
 studentCache,
 getStudentCalendar
);

router.get(
 "/settings",
 requireAuth,
 requireStudent,
 studentCache,
 getSettings
);

router.get(
  "/profile",
  requireAuth,
  requireStudent,
  studentCache,
  getStudentProfile
);

router.get(
  "/classes",
  requireAuth,
  requireStudent,
  studentCache,
  getStudentClasses
);

router.get(
 "/classes/:id",
 requireAuth,
 requireStudent,
 studentCache,
 getStudentClassDetails
);

router.get(
 "/classes/:id/comments",
 requireAuth,
 requireStudent,
 listStudentClassComments
);

router.post(
 "/classes/:id/comments",
 requireAuth,
 requireStudent,
 validateBody(classCommentSchema),
 createStudentClassComment
);

router.get(
  "/assignments",
  requireAuth,
  requireStudent,
  studentCache,
  getStudentAssignments
);

router.get(
  "/announcements",
  requireAuth,
  requireStudent,
  studentCache,
  getStudentAnnouncements
);

router.post(
 "/assignments/:id/submit",
 requireAuth,
 requireStudent,
 validateBody(submitAssignmentSchema),
 submitAssignment
);

router.delete(
 "/assignments/:id/submission",
 requireAuth,
 requireStudent,
 deleteSubmission
);

router.get(
  "/submissions",
  requireAuth,
  requireStudent,
  studentCache,
  getStudentSubmissions
);

router.get(
  "/analytics",
  requireAuth,
  requireStudent,
  studentCache,
  getStudentAnalytics
);


export default router;
