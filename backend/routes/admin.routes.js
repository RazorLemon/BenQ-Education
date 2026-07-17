import express from "express";

import {
  createTeacher,
  createStudent,
  createClass,
  getClasses,
  getDashboard,
  getLogs,
  getStudents,
  getTeachers,
  getAssignments,
  getSubmissionsAdmin,
  updateClass,
  deleteClass,
  bulkDeleteClasses,
  getAdminAnalytics,
  getAdminTrends,
  getAnnouncements,
  createAnnouncement,
  getAdminClassDetails,
  getStudentDetails,
  updateStudent,
  deleteStudent,
  getAvailableStudentsForClass,
  enrollStudent,
  enrollStudentInClass,
  removeStudentFromClass,
  resetStudentPassword,
  resetTeacherPassword,
  updateTeacher,
  deleteTeacher,
  getTeacherPermissions,
  updateTeacherPermissions
} from "../controllers/admin.controller.js";

import {
  requireAuth
} from "../middleware/auth.middleware.js";

import {
  requireAdmin
} from "../middleware/role.middleware.js";

import {
  validateBody
} from "../middleware/validate.middleware.js";

import {
  cacheResponse
} from "../middleware/cache.middleware.js";

import {
  createTeacherSchema,
  updateTeacherSchema,
  createStudentSchema,
  createClassSchema,
  updateClassSchema,
  adminAnnouncementSchema,
  updateStudentSchema,
  enrollStudentSchema,
  enrollClassSchema,
  resetPasswordSchema,
  teacherPermissionSchema,
  adminSettingsSchema,
  calendarEventSchema
} from "../validation/schemas.js";

import {
 getAdminCalendar,
 createAdminCalendarEvent
} from "../controllers/calendar.controller.js";

import {
 getSettings,
 updateSettings
} from "../controllers/settings.controller.js";

const router = express.Router();

const adminCache =
  cacheResponse({
    namespace: "admin"
  });

router.post(
  "/teachers",
  requireAuth,
  requireAdmin,
  validateBody(createTeacherSchema),
  createTeacher
);

router.get(
 "/permissions",
 requireAuth,
 requireAdmin,
 adminCache,
 getTeacherPermissions
);

router.put(
 "/permissions/:id",
 requireAuth,
 requireAdmin,
 validateBody(teacherPermissionSchema),
 updateTeacherPermissions
);

router.get(
 "/settings",
 requireAuth,
 requireAdmin,
 getSettings
);

router.put(
 "/settings",
 requireAuth,
 requireAdmin,
 validateBody(adminSettingsSchema),
 updateSettings
);

router.post(
  "/students",
  requireAuth,
  requireAdmin,
  validateBody(createStudentSchema),
  createStudent
);

router.post(
  "/classes",
  requireAuth,
  requireAdmin,
  validateBody(createClassSchema),
  createClass
);

router.get(
  "/classes",
  requireAuth,
  requireAdmin,
  adminCache,
  getClasses
);

router.get(
  "/dashboard",
  requireAuth,
  requireAdmin,
  adminCache,
  getDashboard
);

router.get(
 "/calendar",
 requireAuth,
 requireAdmin,
 adminCache,
 getAdminCalendar
);

router.post(
 "/calendar",
 requireAuth,
 requireAdmin,
 validateBody(calendarEventSchema),
 createAdminCalendarEvent
);

router.get(
  "/logs",
  requireAuth,
  requireAdmin,
  adminCache,
  getLogs
);

router.get(
  "/students",
  requireAuth,
  requireAdmin,
  adminCache,
  getStudents
);

router.get(
  "/teachers",
  requireAuth,
  requireAdmin,
  adminCache,
  getTeachers
);

router.put(
 "/teachers/:id",
 requireAuth,
 requireAdmin,
 validateBody(updateTeacherSchema),
 updateTeacher
);

router.delete(
 "/teachers/:id",
 requireAuth,
 requireAdmin,
 deleteTeacher
);

router.get(
  "/assignments",
  requireAuth,
  requireAdmin,
  adminCache,
  getAssignments
);

router.get(
  "/submissions",
  requireAuth,
  requireAdmin,
  adminCache,
  getSubmissionsAdmin
);

router.put(
 "/classes/:id",
 requireAuth,
 requireAdmin,
 validateBody(updateClassSchema),
 updateClass
);

router.delete(
 "/classes/:id",
 requireAuth,
 requireAdmin,
 deleteClass
);

router.post(
 "/classes/bulk-delete",
 requireAuth,
 requireAdmin,
 bulkDeleteClasses
);

router.get(
 "/analytics",
 requireAuth,
 requireAdmin,
 adminCache,
 getAdminAnalytics
);

router.get(
 "/analytics/trends",
 requireAuth,
 requireAdmin,
 adminCache,
 getAdminTrends
);

router.get(
 "/announcements",
 requireAuth,
 requireAdmin,
 adminCache,
 getAnnouncements
);

router.post(
 "/announcements",
 requireAuth,
 requireAdmin,
 validateBody(adminAnnouncementSchema),
 createAnnouncement
);

router.get(
 "/classes/:id",
 requireAuth,
 requireAdmin,
 adminCache,
 getAdminClassDetails
);

router.get(
 "/students/:id",
 requireAuth,
 requireAdmin,
 adminCache,
 getStudentDetails
);

router.put(
 "/students/:id",
 requireAuth,
 requireAdmin,
 validateBody(updateStudentSchema),
 updateStudent
);

router.delete(
 "/students/:id",
 requireAuth,
 requireAdmin,
 deleteStudent
);

router.get(
 "/classes/:id/available-students",
 requireAuth,
 requireAdmin,
 adminCache,
 getAvailableStudentsForClass
);

router.post(
 "/classes/:id/enroll",
 requireAuth,
 requireAdmin,
 validateBody(enrollStudentSchema),
 enrollStudentInClass
);

router.post(
 "/students/:id/enroll",
 requireAuth,
 requireAdmin,
 validateBody(enrollClassSchema),
 enrollStudent
);

router.delete(

 "/students/:studentId/classes/:classId",

 requireAuth,

 requireAdmin,

 removeStudentFromClass

);

router.put(

 "/students/:id/reset-password",

 requireAuth,

 requireAdmin,

 validateBody(resetPasswordSchema),

 resetStudentPassword

);

router.put(

 "/teachers/:id/reset-password",

 requireAuth,

 requireAdmin,

 validateBody(resetPasswordSchema),

 resetTeacherPassword

);

export default router;
