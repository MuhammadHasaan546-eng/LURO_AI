import "server-only";

import mongoose from "mongoose";
import { env } from "@/lib/env";
import { hasProEntitlement } from "@/lib/billing";
import { connectToDatabase, withMongoTransaction } from "@/lib/mongoose";
import {
  RateLimitBucketModel,
  SubscriptionModel,
  UsageModel,
  UsageCounterModel,
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

const calendarPeriodBounds = (date = new Date()) => ({
  start: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)),
  end: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1)),
});

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

export const getBillingAccess = async (userId: string) => {
  await connectToDatabase();
  const subscription = (await SubscriptionModel.findOne({
    userId,
  }).lean()) as Subscription | null;
  const entitled = Boolean(subscription && hasProEntitlement(subscription));
  const calendar = calendarPeriodBounds();
  const periodStart =
    entitled && subscription?.currentPeriodStart
      ? new Date(subscription.currentPeriodStart)
      : calendar.start;
  const periodEnd =
    entitled && subscription?.currentPeriodEnd
      ? new Date(subscription.currentPeriodEnd)
      : calendar.end;
  return {
    plan: entitled ? ("pro" as const) : ("free" as const),
    entitled,
    subscription,
    periodStart,
    periodEnd,
  };
};

export const getPlan = async (userId: string) =>
  (await getBillingAccess(userId)).plan;

export const usageSummary = async (userId: string) => {
  await connectToDatabase();
  const access = await getBillingAccess(userId);
  const totals = await UsageCounterModel.find({
    userId,
    period: currentPeriod(access.periodStart),
  }).lean();
  const used = { tokens: 0, images: 0, pages: 0 };
  for (const total of totals) {
    const unit = total.unit as UsageUnit;
    if (unit in used) used[unit] = total.used;
  }
  const planLimits = limits[access.plan];
  return {
    period: currentPeriod(access.periodStart),
    periodStart: access.periodStart.toISOString(),
    periodEnd: access.periodEnd.toISOString(),
    plan: access.plan,
    entitled: access.entitled,
    status: access.subscription?.status ?? "inactive",
    cancelAtPeriodEnd: Boolean(access.subscription?.cancelAtPeriodEnd),
    used,
    limits: planLimits,
    remaining: {
      tokens: Math.max(0, planLimits.tokens - used.tokens),
      images: Math.max(0, planLimits.images - used.images),
      pages: Math.max(0, planLimits.pages - used.pages),
    },
  };
};

export const reserveUsage = async (input: {
  userId: string;
  unit: UsageUnit;
  quantity: number;
  feature: UsageFeature;
  model: string;
  resourceId?: string;
}) => {
  if (!Number.isInteger(input.quantity) || input.quantity <= 0)
    throw new HttpError(400, "INVALID_USAGE_RESERVATION", "Invalid usage reservation.");

  const access = await getBillingAccess(input.userId);
  const period = currentPeriod(access.periodStart);
  const counterId = `${input.userId}:${period}:${input.unit}`;
  const limit = limits[access.plan][input.unit];

  return withMongoTransaction(async (session) => {
    await UsageCounterModel.updateOne(
      { id: counterId },
      { $setOnInsert: { id: counterId, userId: input.userId, period, unit: input.unit, used: 0 } },
      { upsert: true, session },
    );
    const counter = await UsageCounterModel.findOneAndUpdate(
      { id: counterId, $expr: { $lte: [{ $add: ["$used", input.quantity] }, limit] } },
      { $inc: { used: input.quantity } },
      { new: true, session, runValidators: true },
    ).lean();
    if (!counter)
      throw new HttpError(402, "USAGE_LIMIT_EXCEEDED", `Monthly ${input.unit} allowance exceeded.`);
    const [reservation] = await UsageModel.create([{
      userId: input.userId,
      feature: input.feature,
      quantity: input.quantity,
      reservedQuantity: input.quantity,
      status: "reserved",
      unit: input.unit,
      model: input.model,
      resourceId: input.resourceId ?? null,
      period,
    }], { session });
    return { id: reservation.id, period };
  });
};

export const releaseUsage = async (reservationId: string) =>
  withMongoTransaction(async (session) => {
    const reservation = (await UsageModel.findOneAndUpdate(
      { id: reservationId, status: "reserved" },
      { $set: { status: "released", quantity: 0 } },
      { new: false, session },
    ).lean()) as { userId: string; period: string; unit: UsageUnit; reservedQuantity: number } | null;
    if (!reservation) return;
    await UsageCounterModel.updateOne(
      { id: `${reservation.userId}:${reservation.period}:${reservation.unit}` },
      { $inc: { used: -reservation.reservedQuantity } },
      { session },
    );
  });

export const commitUsage = async (reservationId: string, actualQuantity: number) => {
  if (!Number.isInteger(actualQuantity) || actualQuantity < 0)
    throw new HttpError(500, "INVALID_USAGE_COMMIT", "Invalid usage commit.");
  return withMongoTransaction(async (session) => {
    const reservation = (await UsageModel.findOne({ id: reservationId, status: "reserved" }).session(session).lean()) as {
      userId: string; period: string; unit: UsageUnit; reservedQuantity: number;
    } | null;
    if (!reservation) return;
    if (actualQuantity > reservation.reservedQuantity)
      throw new HttpError(409, "USAGE_RESERVATION_TOO_SMALL", "Actual usage exceeded the reservation estimate.");
    const delta = actualQuantity - reservation.reservedQuantity;
    if (delta !== 0) {
      // The provider has already consumed this usage, so reconciliation must
      // always record the exact amount. A conservative reservation estimate
      // bounds any possible overage while negative deltas refund unused units.
      await UsageCounterModel.updateOne(
        { id: `${reservation.userId}:${reservation.period}:${reservation.unit}` },
        { $inc: { used: delta } },
        { session, runValidators: true },
      );
    }
    await UsageModel.updateOne(
      { id: reservationId, status: "reserved" },
      { $set: { status: "committed", quantity: actualQuantity } },
      { session },
    );
  });
};

export const enforceAiRateLimit = async (userId: string, action: string) => {
  await connectToDatabase();
  const plan = await getPlan(userId);
  const capacity = plan === "pro" ? 100 : 20;
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
  if (bucket && bucket.count > capacity)
    throw new HttpError(
      429,
      "RATE_LIMITED",
      "Too many AI requests. Try again shortly.",
    );
};

export const trustedBeforeFilter = (before?: Date) =>
  before ? { createdAt: mongoose.trusted({ $lt: before }) } : {};
