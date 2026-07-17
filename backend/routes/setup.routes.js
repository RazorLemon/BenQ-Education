import express from "express";
import {
  createSchoolAdmin
} from "../controllers/setup.controller.js";
import {
  validateBody
} from "../middleware/validate.middleware.js";
import {
  createRateLimiter
} from "../middleware/rateLimit.middleware.js";
import {
  schoolSetupSchema
} from "../validation/schemas.js";

const router =
  express.Router();

const setupRateLimiter =
  createRateLimiter({
    windowMs:
      15 * 60 * 1000,
    maxRequests:10,
    message:
      "Too many setup attempts. Please try again later."
  });

router.post(
  "/school-admin",
  setupRateLimiter,
  validateBody(schoolSetupSchema),
  createSchoolAdmin
);

export default router;
