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
  EMAIL_APP_NAME: Joi.string().trim().min(1).max(100).default("Luro AI"),
  AUTH_NOTIFICATION_EMAILS_ENABLED: Joi.boolean()
    .truthy("true")
    .falsy("false")
    .default(false),
  SOCIAL_X_URL: Joi.string()
    .uri({ scheme: ["https"] })
    .max(2048),
  SOCIAL_LINKEDIN_URL: Joi.string()
    .uri({ scheme: ["https"] })
    .max(2048),
  SOCIAL_INSTAGRAM_URL: Joi.string()
    .uri({ scheme: ["https"] })
    .max(2048),
  SMTP_HOST: Joi.string().hostname().max(253),
  SMTP_PORT: Joi.number().integer().valid(465, 587),
  SMTP_SECURE: Joi.boolean().truthy("true").falsy("false"),
  SMTP_USER: Joi.string().email().max(254),
  SMTP_PASS: Joi.string().min(1).max(1024),
  EMAIL_WEBHOOK_URL: Joi.string()
    .uri({ scheme: ["https"] })
    .max(2048),
  EMAIL_WEBHOOK_SECRET: Joi.string().min(16).max(2048),
  
  // OpenAI-compatible provider configuration. OpenRouter is the canonical deployment.
  OPENROUTER_API_KEY: Joi.string().min(1).max(2048),
  OPENROUTER_BASE_URL: Joi.string()
    .uri({ scheme: ["https"] })
    .max(2048)
    .default("https://openrouter.ai/api/v1"),
  OPENROUTER_CHAT_MODEL: Joi.string().trim().min(1).max(100).default("openai/gpt-oss-20b:free"),
  OPENROUTER_EMBEDDING_MODEL: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .default("openai/text-embedding-3-small"),

  // Pollinations Configuration
  POLLINATIONS_API_KEY: Joi.string().allow("").max(2048).default(""),
  POLLINATIONS_BASE_URL: Joi.string()
    .uri({ scheme: ["https"] })
    .max(2048)
    .default("https://gen.pollinations.ai/image"),
  POLLINATIONS_IMAGE_MODEL: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .default("dreamshaper"),

  CLOUDINARY_CLOUD_NAME: Joi.string().trim().min(1).max(255),
  CLOUDINARY_API_KEY: Joi.string().trim().min(1).max(255),
  CLOUDINARY_API_SECRET: Joi.string().min(1).max(2048),
  STRIPE_SECRET_KEY: Joi.string().allow("").max(2048),
  STRIPE_WEBHOOK_SECRET: Joi.string().allow("").max(2048),
  STRIPE_PRO_PRICE_ID: Joi.string().allow("").max(255),
  APP_FREE_MONTHLY_TOKENS: Joi.number()
    .integer()
    .min(0)
    .max(100_000_000)
    .default(50_000),
  APP_FREE_MONTHLY_IMAGES: Joi.number()
    .integer()
    .min(0)
    .max(100_000)
    .default(5),
  APP_FREE_MONTHLY_PDF_PAGES: Joi.number()
    .integer()
    .min(0)
    .max(100_000)
    .default(50),
  APP_PRO_MONTHLY_TOKENS: Joi.number()
    .integer()
    .min(0)
    .max(1_000_000_000)
    .default(1_000_000),
  APP_PRO_MONTHLY_IMAGES: Joi.number()
    .integer()
    .min(0)
    .max(1_000_000)
    .default(100),
  APP_PRO_MONTHLY_PDF_PAGES: Joi.number()
    .integer()
    .min(0)
    .max(1_000_000)
    .default(2_000),
  APP_MAX_PDF_BYTES: Joi.number()
    .integer()
    .min(1024)
    .max(50_000_000)
    .default(10_000_000),
})
  .unknown(true)
  .custom((value, helpers) => {
    if (value.NODE_ENV === "production") {
      const appHostname = new URL(String(value.APP_URL)).hostname;
      const isLocalApp =
        appHostname === "localhost" ||
        appHostname === "127.0.0.1" ||
        appHostname === "::1";
      const mongoHostname = new URL(String(value.MONGODB_URI)).hostname;
      const isLocalMongo =
        mongoHostname === "localhost" ||
        mongoHostname === "127.0.0.1" ||
        mongoHostname === "::1";

      if (!value.AUTH_SECRET)
        return helpers.error("any.custom", {
          message: "AUTH_SECRET is required in production",
        });
      if (!isLocalApp && !String(value.APP_URL).startsWith("https://"))
        return helpers.error("any.custom", {
          message: "APP_URL must use HTTPS in production",
        });
      if (!isLocalApp && isLocalMongo)
        return helpers.error("any.custom", {
          message: "MONGODB_URI must be explicitly configured in production",
        });
    }

    const smtp = [
      value.SMTP_HOST,
      value.SMTP_PORT,
      value.SMTP_SECURE,
      value.SMTP_USER,
      value.SMTP_PASS,
    ];
    const hasAnySmtpValue = smtp.some((item) => item !== undefined);
    const hasAllSmtpValues = smtp.every(
      (item) => item !== undefined && item !== "",
    );
    if (hasAnySmtpValue && !hasAllSmtpValues)
      return helpers.error("any.custom", {
        message:
          "SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, and SMTP_PASS must all be configured together",
      });

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

    const cloudinary = [
      value.CLOUDINARY_CLOUD_NAME,
      value.CLOUDINARY_API_KEY,
      value.CLOUDINARY_API_SECRET,
    ];
    if (cloudinary.some(Boolean) && !cloudinary.every(Boolean))
      return helpers.error("any.custom", {
        message: "All Cloudinary credentials must be configured",
      });

    // STRIPE VALIDATION RELAXED: Webhook secret optionally chal sakta hai local dev mein
    const stripe = [
      value.STRIPE_SECRET_KEY,
      value.STRIPE_PRO_PRICE_ID,
    ];
    if (stripe.some(Boolean) && !stripe.every(Boolean))
      return helpers.error("any.custom", {
        message:
          "STRIPE_SECRET_KEY and STRIPE_PRO_PRICE_ID must be configured together",
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
  console.error("❌ Environment validation error:", details);
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
  EMAIL_APP_NAME: string;
  AUTH_NOTIFICATION_EMAILS_ENABLED: boolean;
  SOCIAL_X_URL?: string;
  SOCIAL_LINKEDIN_URL?: string;
  SOCIAL_INSTAGRAM_URL?: string;
  SMTP_HOST?: string;
  SMTP_PORT?: 465 | 587;
  SMTP_SECURE?: boolean;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  EMAIL_WEBHOOK_URL?: string;
  EMAIL_WEBHOOK_SECRET?: string;
  OPENROUTER_API_KEY?: string;
  OPENROUTER_BASE_URL: string;
  OPENROUTER_CHAT_MODEL: string;
  OPENROUTER_EMBEDDING_MODEL: string;
  POLLINATIONS_API_KEY?: string;
  POLLINATIONS_BASE_URL: string;
  POLLINATIONS_IMAGE_MODEL: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRO_PRICE_ID?: string;
  APP_FREE_MONTHLY_TOKENS: number;
  APP_FREE_MONTHLY_IMAGES: number;
  APP_FREE_MONTHLY_PDF_PAGES: number;
  APP_PRO_MONTHLY_TOKENS: number;
  APP_PRO_MONTHLY_IMAGES: number;
  APP_PRO_MONTHLY_PDF_PAGES: number;
  APP_MAX_PDF_BYTES: number;
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