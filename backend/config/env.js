import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const PLACEHOLDER_VALUES = [
  "replace-with",
  "your-",
  "USER:PASSWORD",
  "HOST:PORT"
];

const envSchema = z.object({
  NODE_ENV:z
    .enum([
      "development",
      "test",
      "production"
    ])
    .default("development"),

  PORT:z
    .coerce
    .number()
    .int()
    .min(1)
    .max(65535)
    .default(5000),

  DATABASE_URL:z
    .string()
    .min(1),

  JWT_SECRET:z
    .string()
    .min(1),

  SCHOOL_SETUP_SECRET:z
    .string()
    .optional(),

  CLIENT_ORIGIN:z
    .string()
    .optional(),

  CLIENT_URL:z
    .string()
    .optional(),

  SMTP_HOST:z
    .string()
    .optional(),

  SMTP_PORT:z
    .coerce
    .number()
    .int()
    .min(1)
    .max(65535)
    .optional(),

  SMTP_SECURE:z
    .enum([
      "true",
      "false"
    ])
    .optional(),

  SMTP_USER:z
    .string()
    .optional(),

  SMTP_PASS:z
    .string()
    .optional(),

  MAIL_FROM:z
    .string()
    .optional(),

  REDIS_URL:z
    .string()
    .default("redis://localhost:6379"),

  CACHE_ENABLED:z
    .enum([
      "true",
      "false"
    ])
    .optional(),

  CACHE_TTL_SECONDS:z
    .coerce
    .number()
    .int()
    .min(1)
    .max(3600)
    .default(60)
});

const result =
  envSchema.safeParse(
    process.env
  );

if(!result.success) {
  console.error(
    "Invalid environment configuration",
    result.error.flatten().fieldErrors
  );

  throw new Error(
    "Invalid environment configuration"
  );
}

const parsedEnv =
  result.data;

const hasPlaceholder = (value = "") =>
  PLACEHOLDER_VALUES.some(
    (placeholder)=>
      value.includes(placeholder)
  );

const rawClientOrigins =
  parsedEnv.CLIENT_ORIGIN ||
  parsedEnv.CLIENT_URL ||
  "http://localhost:5173";

const clientOrigins =
  rawClientOrigins
    .split(",")
    .map((origin)=>
      origin.trim()
    )
    .filter(Boolean);

const invalidClientOrigins =
  clientOrigins.filter(
    (origin)=>{
      try{
        new URL(origin);
        return false;
      }catch{
        return true;
      }
    }
  );

const productionErrors = [];

if(parsedEnv.NODE_ENV === "production") {
  if(parsedEnv.JWT_SECRET.length < 32) {
    productionErrors.push(
      "JWT_SECRET must be at least 32 characters in production"
    );
  }

  if(hasPlaceholder(parsedEnv.JWT_SECRET)) {
    productionErrors.push(
      "JWT_SECRET still looks like a placeholder"
    );
  }

  if(
    !parsedEnv.SCHOOL_SETUP_SECRET ||
    parsedEnv.SCHOOL_SETUP_SECRET.length < 16
  ) {
    productionErrors.push(
      "SCHOOL_SETUP_SECRET must be at least 16 characters in production"
    );
  }

  if(hasPlaceholder(parsedEnv.SCHOOL_SETUP_SECRET)) {
    productionErrors.push(
      "SCHOOL_SETUP_SECRET still looks like a placeholder"
    );
  }

  if(hasPlaceholder(parsedEnv.DATABASE_URL)) {
    productionErrors.push(
      "DATABASE_URL still looks like a placeholder"
    );
  }

  if(!parsedEnv.CLIENT_ORIGIN && !parsedEnv.CLIENT_URL) {
    productionErrors.push(
      "CLIENT_ORIGIN must be set in production"
    );
  }

  if(
    clientOrigins.some(
      (origin)=>
        origin.includes("localhost") ||
        origin.includes("127.0.0.1")
    )
  ) {
    productionErrors.push(
      "CLIENT_ORIGIN must not point to localhost in production"
    );
  }

}

if(invalidClientOrigins.length > 0) {
  productionErrors.push(
    `CLIENT_ORIGIN has invalid URL values: ${invalidClientOrigins.join(", ")}`
  );
}

if(productionErrors.length > 0) {
  console.error(
    "Production environment is not ready:",
    productionErrors
  );

  throw new Error(
    "Production environment is not ready"
  );
}

const primaryClientOrigin =
  clientOrigins[0] ||
  "http://localhost:5173";

export const env = {
  ...parsedEnv,
  SMTP_SECURE:
    parsedEnv.SMTP_SECURE === "true",
  MAIL_FROM:
    parsedEnv.MAIL_FROM ||
    parsedEnv.SMTP_USER,
  CACHE_ENABLED:
    parsedEnv.CACHE_ENABLED !== "false",
  PRIMARY_CLIENT_ORIGIN:
    primaryClientOrigin,
  CLIENT_ORIGINS:
    clientOrigins
};
