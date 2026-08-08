import "server-only";

import mongoose from "mongoose";
import { env } from "@/lib/env";
import { hasProEntitlement } from "@/lib/billing";
import { connectToDatabase } from "@/lib/mongoose";
import {
  RateLimitBucketModel,
  SubscriptionModel,
  UsageModel,
  type RateLimitBucket,
  type Subscription,
} from "@/models";
import { HttpError } from "@/lib/ai/http";

export type UsageUnit = "tokens" | "images" | "pages";
export type UsageFeature =
  | "chat"
  | "social"
  | "email"
  | "translation"
  | "image"
  | "pdf";

export const currentPeriod = (date = new Date()) =>
  date.toISOString().slice(0, 7);

const limits = {
  free: {
    tokens: env.APP_FREE_MONTHLY_TOKENS,
    images: env.APP_FREE_MONTHLY_IMAGES,
    pages: env.APP_FREE_MONTHLY_PDF_PAGES,
  },
  pro: {
    tokens: env.APP_PRO_MONTHLY_TOKENS,
    images: env.APP_PRO_MONTHLY_IMAGES,
    pages: env.APP_PRO_MONTHLY_PDF_PAGES,
  },
} as const;

export const getPlan = async (userId: string) => {
  await connectToDatabase();
  const subscription = (await SubscriptionModel.findOne({
    userId,
  }).lean()) as Subscription | null;
  return subscription && hasProEntitlement(subscription)
    ? "pro"
    : "free";
};

export const usageSummary = async (userId: string) => {
  await connectToDatabase();
  const period = currentPeriod();
  const [plan, totals] = await Promise.all([
    getPlan(userId),
    UsageModel.aggregate<{ _id: UsageUnit; quantity: number }>([
      { $match: { userId, period } },
      { $group: { _id: "$unit", quantity: { $sum: "$quantity" } } },
    ]),
  ]);
  const used = { tokens: 0, images: 0, pages: 0 };
  for (const total of totals) used[total._id] = total.quantity;
  return { period, plan, used, limits: limits[plan] };
};

export const assertUsageAvailable = async (
  userId: string,
  unit: UsageUnit,
  requested = 1,
) => {
  const summary = await usageSummary(userId);
  if (summary.used[unit] + requested > summary.limits[unit])
    throw new HttpError(
      402,
      "USAGE_LIMIT_EXCEEDED",
      `Monthly ${unit} allowance exceeded.`,
    );
  return summary;
};

export const recordUsage = async (input: {
  userId: string;
  feature: UsageFeature;
  quantity: number;
  unit: UsageUnit;
  model: string;
  resourceId?: string;
}) => {
  if (!Number.isFinite(input.quantity) || input.quantity < 0) return;
  await connectToDatabase();
  await UsageModel.create({ ...input, period: currentPeriod() });
};

export const enforceAiRateLimit = async (userId: string, action: string) => {
  await connectToDatabase();
  const now = new Date();
  const windowStart = new Date(Math.floor(now.getTime() / 60_000) * 60_000);
  const id = `ai:${action}:${userId}:${windowStart.toISOString()}`;
  const bucket = (await RateLimitBucketModel.findOneAndUpdate(
    { id },
    {
      $inc: { count: 1 },
      $setOnInsert: { id, windowStart, blockedUntil: null },
    },
    { upsert: true, new: true, runValidators: true },
  ).lean()) as RateLimitBucket | null;
  if (bucket && bucket.count > 20)
    throw new HttpError(
      429,
      "RATE_LIMITED",
      "Too many AI requests. Try again shortly.",
    );
};

export const trustedBeforeFilter = (before?: Date) =>
  before ? { createdAt: mongoose.trusted({ $lt: before }) } : {};
