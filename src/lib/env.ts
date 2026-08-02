import Joi from "joi";

const environmentSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "test", "production")
    .default("development"),
  APP_URL: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .default("http://localhost:3000"),
  MONGODB_URI: Joi.string()
    .uri({ scheme: ["mongodb", "mongodb+srv"] })
    .max(2048)
    .default("mongodb://127.0.0.1:27017"),
  MONGODB_DATABASE: Joi.string()
    .pattern(/^[A-Za-z0-9_-]+$/)
    .max(64)
    .default("luro-ai"),
  MONGODB_MAX_POOL_SIZE: Joi.number().integer().min(1).max(100).default(10),
  MONGODB_MIN_POOL_SIZE: Joi.number().integer().min(0).max(20).default(0),
  MONGODB_SERVER_SELECTION_TIMEOUT_MS: Joi.number()
    .integer()
    .min(1000)
    .max(60000)
    .default(10000),
  AUTH_SECRET: Joi.string().min(32).max(1024),
  AUTH_EMAIL_PASSWORD_ENABLED: Joi.boolean()
    .truthy("true")
    .falsy("false")
    .default(true),
  GOOGLE_CLIENT_ID: Joi.string().trim().max(512),
  GOOGLE_CLIENT_SECRET: Joi.string().max(2048),
  APPLE_CLIENT_ID: Joi.string().trim().max(512),
  APPLE_TEAM_ID: Joi.string().trim().max(128),
  APPLE_KEY_ID: Joi.string().trim().max(128),
  APPLE_PRIVATE_KEY: Joi.string().max(16384),
  EMAIL_FROM: Joi.string().email().max(254),
  EMAIL_WEBHOOK_URL: Joi.string()
    .uri({ scheme: ["https"] })
    .max(2048),
  EMAIL_WEBHOOK_SECRET: Joi.string().min(16).max(2048),
})
  .unknown(true)
  .custom((value, helpers) => {
    if (value.NODE_ENV === "production") {
      if (!value.AUTH_SECRET)
        return helpers.error("any.custom", {
          message: "AUTH_SECRET is required in production",
        });
      if (!String(value.APP_URL).startsWith("https://"))
        return helpers.error("any.custom", {
          message: "APP_URL must use HTTPS in production",
        });
      if (String(value.MONGODB_URI).startsWith("mongodb://127.0.0.1"))
        return helpers.error("any.custom", {
          message: "MONGODB_URI must be explicitly configured in production",
        });
    }

    const google = [value.GOOGLE_CLIENT_ID, value.GOOGLE_CLIENT_SECRET];
    if (google.some(Boolean) && !google.every(Boolean))
      return helpers.error("any.custom", {
        message: "Google client ID and secret must both be configured",
      });

    const apple = [
      value.APPLE_CLIENT_ID,
      value.APPLE_TEAM_ID,
      value.APPLE_KEY_ID,
      value.APPLE_PRIVATE_KEY,
    ];
    if (apple.some(Boolean) && !apple.every(Boolean))
      return helpers.error("any.custom", {
        message: "All Apple credentials must be configured",
      });

    return value;
  }, "cross-field environment validation");

const { value, error } = environmentSchema.validate(process.env, {
  abortEarly: false,
  convert: true,
});

if (error) {
  const details = error.details
    .map((detail) =>
      detail.type === "any.custom"
        ? String(detail.context?.message ?? detail.message)
        : `${detail.path.join(".")}: ${detail.message}`,
    )
    .join("; ");
  throw new Error(`Invalid environment configuration: ${details}`);
}

export const env = value as {
  NODE_ENV: "development" | "test" | "production";
  APP_URL: string;
  MONGODB_URI: string;
  MONGODB_DATABASE: string;
  MONGODB_MAX_POOL_SIZE: number;
  MONGODB_MIN_POOL_SIZE: number;
  MONGODB_SERVER_SELECTION_TIMEOUT_MS: number;
  AUTH_SECRET?: string;
  AUTH_EMAIL_PASSWORD_ENABLED: boolean;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  APPLE_CLIENT_ID?: string;
  APPLE_TEAM_ID?: string;
  APPLE_KEY_ID?: string;
  APPLE_PRIVATE_KEY?: string;
  EMAIL_FROM?: string;
  EMAIL_WEBHOOK_URL?: string;
  EMAIL_WEBHOOK_SECRET?: string;
};

export const isGoogleEnabled = Boolean(
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET,
);
export const isAppleEnabled = Boolean(
  env.APPLE_CLIENT_ID &&
  env.APPLE_TEAM_ID &&
  env.APPLE_KEY_ID &&
  env.APPLE_PRIVATE_KEY,
);
