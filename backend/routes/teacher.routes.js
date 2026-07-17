import express from "express";

import {
  getTeacherClasses,
  createAssignment,
  getAssignments,
  createAnnouncement,
  getAnnouncements,
  getSubmissions,
  getAssignmentLogs,
  gradeSubmission,
  getTeacherDashboard,
  getClassStudents,
  updateAssignment,
  deleteAssignment,
    updateAnnouncement,
    deleteAnnouncement,
    getTeacherAnalytics,
    getPerformanceTrends,
    getClassDetails,
    getUpcomingDeadlines,
    getStudentPerformance,
  getAssignmentAnalytics,
    getTeacherProfile,
    getTeacherPermissions,
    createStudent,
    createClass,
    getAvailableStudentsForClass,
    enrollStudentInClass,
    updateStudent
}
from "../controllers/teacher.controller.js";

import {
  requireAuth
}
from "../middleware/auth.middleware.js";

import {
  requireTeacher
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
  teacherAssignmentSchema,
  updateTeacherAssignmentSchema,
  teacherAnnouncementSchema,
  updateTeacherAnnouncementSchema,
  gradeSubmissionSchema,
  createStudentSchema,
  teacherCreateClassSchema,
  enrollStudentSchema,
  updateStudentSchema,
  calendarEventSchema,
  classCommentSchema,
  classCommentPinSchema
}
from "../validation/schemas.js";

import {
  getTeacherCalendar,
  createTeacherCalendarEvent
}
from "../controllers/calendar.controller.js";

import {
 getSettings
}
from "../controllers/settings.controller.js";

import {
 listTeacherClassComments,
 createTeacherClassComment,
 pinTeacherClassComment
}
from "../controllers/classComment.controller.js";

const router = express.Router();

const teacherCache =
  cacheResponse({
    namespace: "teacher"
  });

router.get(
  "/classes",
  requireAuth,
  requireTeacher,
  teacherCache,
  getTeacherClasses
);

router.get(
 "/permissions",
 requireAuth,
 requireTeacher,
 teacherCache,
 getTeacherPermissions
);

router.get(
 "/settings",
 requireAuth,
 requireTeacher,
 teacherCache,
 getSettings
);

router.post(
 "/students",
 requireAuth,
 requireTeacher,
 validateBody(createStudentSchema),
 createStudent
);

router.post(
 "/classes",
 requireAuth,
 requireTeacher,
 validateBody(teacherCreateClassSchema),
 createClass
);

router.get(
 "/classes/:id/available-students",
 requireAuth,
 requireTeacher,
 teacherCache,
 getAvailableStudentsForClass
);

router.post(
 "/classes/:id/enroll",
 requireAuth,
 requireTeacher,
 validateBody(enrollStudentSchema),
 enrollStudentInClass
);

router.post(
  "/assignments",
  requireAuth,
  requireTeacher,
  validateBody(teacherAssignmentSchema),
  createAssignment
);

router.get(
  "/assignments",
  requireAuth,
  requireTeacher,
  teacherCache,
  getAssignments
);

router.post(
  "/announcements",
  requireAuth,
  requireTeacher,
  validateBody(teacherAnnouncementSchema),
  createAnnouncement
);

router.get(
  "/announcements",
  requireAuth,
  requireTeacher,
  teacherCache,
  getAnnouncements
);

router.get(
  "/submissions",
  requireAuth,
  requireTeacher,
  teacherCache,
  getSubmissions
);

router.get(
  "/logs",
  requireAuth,
  requireTeacher,
  teacherCache,
  getAssignmentLogs
);

router.post(
  "/submissions/:id/grade",
  requireAuth,
  requireTeacher,
  validateBody(gradeSubmissionSchema),
  gradeSubmission
);

router.get(
  "/dashboard",
  requireAuth,
  requireTeacher,
  teacherCache,
  getTeacherDashboard
);

router.get(
 "/calendar",
 requireAuth,
 requireTeacher,
 teacherCache,
 getTeacherCalendar
);

router.post(
 "/calendar",
 requireAuth,
 requireTeacher,
 validateBody(calendarEventSchema),
 createTeacherCalendarEvent
);

router.get(
 "/analytics",
 requireAuth,
 requireTeacher,
 teacherCache,
 getTeacherAnalytics
);

router.get(
 "/analytics/trends",
 requireAuth,
 requireTeacher,
 teacherCache,
 getPerformanceTrends
);

router.get(
  "/classes/:id/students",
  requireAuth,
  requireTeacher,
  teacherCache,
  getClassStudents
);

router.put(
 "/assignments/:id",
 requireAuth,
 requireTeacher,
 validateBody(updateTeacherAssignmentSchema),
 updateAssignment
);

router.delete(
 "/assignments/:id",
 requireAuth,
 requireTeacher,
 deleteAssignment
);

router.put(
 "/announcements/:id",
 requireAuth,
 requireTeacher,
 validateBody(updateTeacherAnnouncementSchema),
 updateAnnouncement
);

router.delete(
 "/announcements/:id",
 requireAuth,
 requireTeacher,
 deleteAnnouncement
);

router.get(
 "/classes/:id",
 requireAuth,
 requireTeacher,
 teacherCache,
 getClassDetails
);

router.get(
 "/classes/:id/comments",
 requireAuth,
 requireTeacher,
 listTeacherClassComments
);

router.post(
 "/classes/:id/comments",
 requireAuth,
 requireTeacher,
 validateBody(classCommentSchema),
 createTeacherClassComment
);

router.patch(
 "/classes/:id/comments/:commentId/pin",
 requireAuth,
 requireTeacher,
 validateBody(classCommentPinSchema),
 pinTeacherClassComment
);

router.get(
 "/upcoming-deadlines",
 requireAuth,
 requireTeacher,
 teacherCache,
 getUpcomingDeadlines
);

router.get(

 "/classes/:classId/students/:studentId",

 requireAuth,

 requireTeacher,

 teacherCache,

 getStudentPerformance

);

router.put(
 "/classes/:classId/students/:studentId",
 requireAuth,
 requireTeacher,
 validateBody(updateStudentSchema),
 updateStudent
);

router.get(
 "/assignments/:id/analytics",
 requireAuth,
 requireTeacher,
 teacherCache,
 getAssignmentAnalytics
);

router.get(
 "/profile",
 requireAuth,
 requireTeacher,
 teacherCache,
 getTeacherProfile
);



export default router;
