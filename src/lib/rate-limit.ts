import { db } from "@/lib/db";
import { hashIp } from "@/lib/auth";

const rules: Record<
  string,
  { limit: number; windowMs: number; blockMs: number }
> = {
  signin: { limit: 10, windowMs: 15 * 60_000, blockMs: 15 * 60_000 },
  signup: { limit: 5, windowMs: 60 * 60_000, blockMs: 60 * 60_000 },
  recovery: { limit: 5, windowMs: 60 * 60_000, blockMs: 60 * 60_000 },
  oauth: { limit: 20, windowMs: 15 * 60_000, blockMs: 15 * 60_000 },
};

export const checkRateLimit = async (
  request: Request,
  action: keyof typeof rules,
  discriminator = "",
) => {
  const rule = rules[action];
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const id = `${action}:${hashIp(ip)}:${discriminator}`;
  const now = new Date();
  const bucket = await db.rateLimitBucket.findUnique({ where: { id } });
  if (bucket?.blockedUntil && bucket.blockedUntil > now)
    return {
      allowed: false,
      retryAfter: Math.ceil(
        (bucket.blockedUntil.getTime() - now.getTime()) / 1000,
      ),
    };
  const reset =
    !bucket || now.getTime() - bucket.windowStart.getTime() >= rule.windowMs;
  const count = reset ? 1 : bucket.count + 1;
  const blockedUntil =
    count > rule.limit ? new Date(now.getTime() + rule.blockMs) : null;
  await db.rateLimitBucket.upsert({
    where: { id },
    create: { id, count, windowStart: now, blockedUntil },
    update: {
      count,
      windowStart: reset ? now : bucket!.windowStart,
      blockedUntil,
    },
  });
  return {
    allowed: !blockedUntil,
    retryAfter: blockedUntil ? Math.ceil(rule.blockMs / 1000) : 0,
  };
};
