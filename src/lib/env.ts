import { z } from "zod";

const booleanFromEnv = z
  .enum(["true", "false"])
  .default("true")
  .transform((value) => value === "true");

const schema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    APP_URL: z.string().url().default("http://localhost:3000"),
    MONGODB_URI: z.string().url().default("mongodb://127.0.0.1:27017"),
    MONGODB_DATABASE: z.string().min(1).default("luro-ai"),
    AUTH_SECRET: z.string().min(32).optional(),
    AUTH_EMAIL_PASSWORD_ENABLED: booleanFromEnv,
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
    APPLE_CLIENT_ID: z.string().min(1).optional(),
    APPLE_TEAM_ID: z.string().min(1).optional(),
    APPLE_KEY_ID: z.string().min(1).optional(),
    APPLE_PRIVATE_KEY: z.string().min(1).optional(),
    EMAIL_FROM: z.string().email().optional(),
    EMAIL_WEBHOOK_URL: z.string().url().optional(),
    EMAIL_WEBHOOK_SECRET: z.string().min(16).optional(),
  })
  .superRefine((env, context) => {
    if (env.NODE_ENV === "production") {
      if (!env.AUTH_SECRET) {
        context.addIssue({
          code: "custom",
          path: ["AUTH_SECRET"],
          message: "AUTH_SECRET is required in production",
        });
      }
      if (!env.APP_URL.startsWith("https://")) {
        context.addIssue({
          code: "custom",
          path: ["APP_URL"],
          message: "APP_URL must use HTTPS in production",
        });
      }
    }

    const google = [env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET];
    if (google.some(Boolean) && !google.every(Boolean)) {
      context.addIssue({
        code: "custom",
        path: ["GOOGLE_CLIENT_ID"],
        message: "Google client ID and secret must both be configured",
      });
    }

    const apple = [
      env.APPLE_CLIENT_ID,
      env.APPLE_TEAM_ID,
      env.APPLE_KEY_ID,
      env.APPLE_PRIVATE_KEY,
    ];
    if (apple.some(Boolean) && !apple.every(Boolean)) {
      context.addIssue({
        code: "custom",
        path: ["APPLE_CLIENT_ID"],
        message: "All Apple credentials must be configured",
      });
    }
  });

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    `Invalid environment configuration: ${parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")}`,
  );
}

export const env = parsed.data;
export const isGoogleEnabled = Boolean(
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET,
);
export const isAppleEnabled = Boolean(
  env.APPLE_CLIENT_ID &&
  env.APPLE_TEAM_ID &&
  env.APPLE_KEY_ID &&
  env.APPLE_PRIVATE_KEY,
);
