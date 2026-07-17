import { z } from "zod";

const trimmedString = (
 field,
 max = 255
) =>
 z.string({
  required_error:
   `${field} is required`
 })
 .trim()
 .min(1, `${field} is required`)
 .max(max, `${field} is too long`);

const email =
 z.string({
  required_error:
   "Email is required"
 })
 .trim()
 .email("Enter a valid email")
 .max(255, "Email is too long")
 .toLowerCase();

const password =
 z.string({
  required_error:
   "Password is required"
 })
 .min(8, "Password must be at least 8 characters")
 .max(128, "Password is too long");

const uuid =
 z.string()
 .uuid("Invalid id");

const optionalTrimmedString = (
 max = 255
) =>
 z.preprocess(
  (value)=>
   value === "" ? undefined : value,
  z.string()
   .trim()
   .min(1, "Value cannot be empty")
   .max(max, "Value is too long")
   .optional()
 );

const optionalUrl =
 z.preprocess(
  (value)=>
   value === "" ? undefined : value,
  z.string()
   .trim()
   .url("Enter a valid URL")
   .max(2048, "URL is too long")
   .optional()
 );

const dueDate =
 z.coerce
 .date({
  required_error:
   "Due date is required",
  invalid_type_error:
   "Enter a valid due date"
 })
 .refine(
  (value)=>
   !Number.isNaN(value.getTime()),
  "Enter a valid due date"
 );

const grade =
 z.coerce
 .number({
  required_error:
   "Grade is required",
  invalid_type_error:
   "Grade must be a number"
 })
 .min(0, "Grade cannot be below 0")
 .max(100, "Grade cannot be above 100");

export const registerSchema =
 z.object({
  name:
   trimmedString("Name"),
  email,
  password,
  schoolCode:
   trimmedString("School", 64)
    .optional(),
  role:
   z.literal("ADMIN")
    .optional()
 });

export const loginSchema =
 z.object({
  email,
  schoolCode:
   trimmedString("School", 64),
  password:
   z.string({
    required_error:
     "Password is required"
   })
   .min(1, "Password is required")
 });

export const schoolSetupSchema =
 z.object({
  schoolName:
   trimmedString("School name"),
  schoolCode:
   trimmedString("School code", 64)
    .regex(
     /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
     "School code must use lowercase letters, numbers, and single hyphens"
    ),
  adminName:
   trimmedString("Admin name"),
  adminEmail:
   email,
  adminPassword:
   password
 });

export const changePasswordSchema =
 z.object({
  currentPassword:
   z.string({
    required_error:
     "Current password is required"
   })
   .min(1, "Current password is required"),
  newPassword:
   password
 });

export const createTeacherSchema =
 z.object({
  name:
   trimmedString("Name"),
  email,
  password,
  employeeId:
   trimmedString("Employee ID", 64)
 });

export const updateTeacherSchema =
 z.object({
  name:
   trimmedString("Name"),
  email,
  employeeId:
   trimmedString("Employee ID", 64)
 });

export const createStudentSchema =
 z.object({
  name:
   trimmedString("Name"),
  email,
  password,
  rollNumber:
   trimmedString("Roll number", 64),
  classSection:
   trimmedString("Class & Section", 64)
 });

export const createClassSchema =
 z.object({
  name:
   trimmedString("Class & Section"),
  code:
   trimmedString("Subject code", 64),
  subject:
   trimmedString("Subject"),
  year:
   z.coerce
    .number()
    .int("Year must be a whole number")
    .min(2000, "Year is too early")
    .max(2100, "Year is too late"),
  teacherId:
   uuid
 });

export const teacherCreateClassSchema =
 createClassSchema.omit({
  teacherId:true
 });

export const updateClassSchema =
 createClassSchema.partial().refine(
  (value)=>
   Object.keys(value).length > 0,
  "Provide at least one field to update"
 );

export const adminAnnouncementSchema =
 z.object({
  title:
   trimmedString("Title"),
  content:
   trimmedString("Content", 5000),
  classIds:
   z.array(uuid)
    .min(1, "Select at least one class")
 });

export const updateStudentSchema =
 z.object({
  name:
   trimmedString("Name"),
  email,
  rollNumber:
   trimmedString("Roll number", 64),
  classSection:
   trimmedString("Class & Section", 64)
 });

export const teacherPermissionSchema =
 z.object({
  canCreateStudents:
   z.boolean(),
  canCreateClasses:
   z.boolean(),
  canEnrollStudents:
   z.boolean(),
  canManageCalendar:
   z.boolean()
 });

export const adminSettingsSchema =
 z.object({
  schoolName:
   trimmedString("School name"),
  schoolCode:
   trimmedString("School code", 64)
    .regex(
     /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
     "School code must use lowercase letters, numbers, and single hyphens"
    ),
  saturdayOff:
   z.boolean(),
  calendarDefaultView:
   z.enum([
    "week",
    "month",
    "year"
   ]),
  cacheEnabled:
   z.boolean(),
  cacheTtlSeconds:
   z.coerce
    .number()
    .int("Cache TTL must be a whole number")
    .min(5, "Cache TTL must be at least 5 seconds")
    .max(3600, "Cache TTL cannot exceed 3600 seconds")
 });

export const calendarEventSchema =
 z.object({
  title:
   trimmedString("Title"),
  description:
   optionalTrimmedString(5000),
  startDate:
   dueDate,
  endDate:
   dueDate,
  eventType:
   z.enum([
    "HOLIDAY",
    "EXAM",
    "EVENT"
   ]),
  scope:
   z.enum([
    "SCHOOL",
    "CLASS",
    "TEACHER"
   ]),
  classIds:
   z.array(uuid)
    .optional()
    .default([])
 })
 .refine(
  (value)=>
   value.endDate >= value.startDate,
  {
   message:"End date must be after start date",
   path:["endDate"]
  }
 );

export const enrollStudentSchema =
 z.object({
  studentId:
   uuid
 });

export const enrollClassSchema =
 z.object({
  classId:
   uuid
 });

export const resetPasswordSchema =
 z.object({
  newPassword:
   password
 });

export const teacherAssignmentSchema =
 z.object({
  title:
   trimmedString("Title"),
  description:
   trimmedString("Description", 5000),
  dueDate,
  classId:
   uuid,
  attachmentUrl:
   optionalUrl,
  attachmentName:
   optionalTrimmedString(255)
 });

export const updateTeacherAssignmentSchema =
 teacherAssignmentSchema
  .extend({
   isPublished:
    z.boolean().optional()
  })
  .partial()
  .refine(
   (value)=>
    Object.keys(value).length > 0,
   "Provide at least one field to update"
  );

export const teacherAnnouncementSchema =
 z.object({
  title:
   trimmedString("Title"),
  content:
   trimmedString("Content", 5000),
  classId:
   uuid
 });

export const updateTeacherAnnouncementSchema =
 teacherAnnouncementSchema.partial().refine(
  (value)=>
   Object.keys(value).length > 0,
  "Provide at least one field to update"
 );

export const gradeSubmissionSchema =
 z.object({
  grade,
  feedback:
   optionalTrimmedString(5000)
 });

export const submitAssignmentSchema =
 z.object({
  fileUrl:
   z.string()
    .trim()
    .url("Enter a valid submission file URL")
    .max(2048, "File URL is too long"),
  fileName:
   trimmedString("File name", 255)
 });

export const classCommentSchema =
 z.object({
  content:
   trimmedString("Comment", 2000),
  parentId:
   uuid.optional()
 });

export const classCommentPinSchema =
 z.object({
  pinned:
   z.boolean()
 });
