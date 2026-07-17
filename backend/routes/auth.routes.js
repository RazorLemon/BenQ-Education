import express from "express";
import {
  register,
  login,
  changePassword,
  listSchools
} from "../controllers/auth.controller.js";
import {
 requireAuth,
 optionalAuth
}
from "../middleware/auth.middleware.js";

import {
 validateBody
}
from "../middleware/validate.middleware.js";

import {
 cacheResponse
}
from "../middleware/cache.middleware.js";

import {
 registerSchema,
 loginSchema,
 changePasswordSchema
}
from "../validation/schemas.js";

import {
 loginRateLimiter,
 passwordChangeRateLimiter
}
from "../middleware/rateLimit.middleware.js";

const router = express.Router();

const authCache =
 cacheResponse({
  namespace: "auth",
  ttl: 300
 });

router.get(
 "/schools",
 authCache,
 listSchools
);

router.post(
 "/register",
 optionalAuth,
 validateBody(registerSchema),
 register
);
router.post(
 "/login",
 loginRateLimiter,
 validateBody(loginSchema),
 login
);
router.post(

 "/change-password",

 requireAuth,

 passwordChangeRateLimiter,

 validateBody(changePasswordSchema),

 changePassword

);


export default router;
