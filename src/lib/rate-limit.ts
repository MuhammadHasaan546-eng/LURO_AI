import { hashIp } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongoose";
import { RateLimitBucketModel, type RateLimitBucket } from "@/models";

const rules = {
  signin: { limit: 10, windowMs: 15 * 60_000 },
  signup: { limit: 5, windowMs: 60 * 60_000 },
  recovery: { limit: 5, windowMs: 60 * 60_000 },
  oauth: { limit: 20, windowMs: 15 * 60_000 },
} as const;

export const checkRateLimit = async (
  request: Request,
  action: keyof typeof rules,
  discriminator = "",
) => {
  await connectToDatabase();
  const rule = rules[action];
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const now = new Date();
  const windowStartMs = Math.floor(now.getTime() / rule.windowMs) * rule.windowMs;
  const windowStart = new Date(windowStartMs);
  const windowEnd = new Date(windowStartMs + rule.windowMs);
  const id = `${action}:${hashIp(ip)}:${discriminator}:${windowStart.toISOString()}`;

  const bucket = (await RateLimitBucketModel.findOneAndUpdate(
    { id },
    {
      $inc: { count: 1 },
      $setOnInsert: { id, windowStart, blockedUntil: null },
    },
    { upsert: true, new: true, runValidators: true },
  ).lean()) as RateLimitBucket | null;

  const allowed = Boolean(bucket && bucket.count <= rule.limit);
  return {
    allowed,
    retryAfter: allowed
      ? 0
      : Math.max(1, Math.ceil((windowEnd.getTime() - now.getTime()) / 1000)),
  };
};
