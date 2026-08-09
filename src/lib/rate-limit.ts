import { hashIp } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongoose";
import { RateLimitBucketModel, type RateLimitBucket } from "@/models";

const rules = {
  signin: { limit: 10, windowMs: 15 * 60_000 },
  signup: { limit: 5, windowMs: 15 * 60_000 },
  signupEmail: { limit: 3, windowMs: 60 * 60_000 },
  recovery: { limit: 5, windowMs: 60 * 60_000 },
  oauth: { limit: 20, windowMs: 15 * 60_000 },
} as const;

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfter: number;
};

export const normalizeEmail = (email: unknown) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

const getClientIp = (request: Request) => {
  const forwarded = request.headers.get("x-forwarded-for");
  const candidate = forwarded?.split(",", 1)[0]?.trim();
  return candidate || request.headers.get("x-real-ip")?.trim() || "unknown";
};

const incrementBucket = async (
  id: string,
  windowStart: Date,
): Promise<RateLimitBucket | null> => {
  try {
    return (await RateLimitBucketModel.findOneAndUpdate(
      { id },
      {
        $inc: { count: 1 },
        $setOnInsert: { id, windowStart, blockedUntil: null },
      },
      { upsert: true, new: true, runValidators: true },
    ).lean()) as RateLimitBucket | null;
  } catch (error) {
    // Concurrent upserts can race on the unique id index. Retry as an update
    // of the document that won the insert; the counter remains atomic.
    if (!(error instanceof Error && /E11000|duplicate key/i.test(error.message)))
      throw error;
    return (await RateLimitBucketModel.findOneAndUpdate(
      { id },
      { $inc: { count: 1 } },
      { new: true, runValidators: true },
    ).lean()) as RateLimitBucket | null;
  }
};

export const checkRateLimit = async (
  request: Request,
  action: keyof typeof rules,
  discriminator = "",
): Promise<RateLimitResult> => {
  await connectToDatabase();
  const rule = rules[action];
  const now = new Date();
  const windowStartMs = Math.floor(now.getTime() / rule.windowMs) * rule.windowMs;
  const windowStart = new Date(windowStartMs);
  const windowEnd = new Date(windowStartMs + rule.windowMs);
  const id = discriminator
    ? `${action}:email:${hashIp(normalizeEmail(discriminator))}:${windowStart.toISOString()}`
    : `${action}:ip:${hashIp(getClientIp(request))}:${windowStart.toISOString()}`;
  const bucket = await incrementBucket(id, windowStart);
  const count = bucket?.count ?? rule.limit + 1;
  const allowed = count <= rule.limit;

  return {
    allowed,
    limit: rule.limit,
    remaining: Math.max(0, rule.limit - count),
    retryAfter: allowed
      ? 0
      : Math.max(1, Math.ceil((windowEnd.getTime() - now.getTime()) / 1000)),
  };
};

export const checkSignupRateLimits = async (
  request: Request,
  email: unknown,
) => {
  // Both increments happen before schema validation and before password work.
  const ipLimit = await checkRateLimit(request, "signup");
  const normalizedEmail = normalizeEmail(email);
  const emailLimit = normalizedEmail
    ? await checkRateLimit(request, "signupEmail", normalizedEmail)
    : null;

  if (!ipLimit.allowed) return ipLimit;
  if (emailLimit && !emailLimit.allowed) return emailLimit;
  return {
    allowed: true,
    limit: Math.min(ipLimit.limit, emailLimit?.limit ?? ipLimit.limit),
    remaining: Math.min(ipLimit.remaining, emailLimit?.remaining ?? ipLimit.remaining),
    retryAfter: 0,
  } satisfies RateLimitResult;
};
