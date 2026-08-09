import "server-only";

import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
import { env } from "@/lib/env";
import { hasProEntitlement } from "@/lib/billing";
import { connectToDatabase } from "@/lib/mongoose";
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

const isMongoError = (error: unknown) =>
  error instanceof mongoose.Error ||
  (typeof error === "object" && error !== null && "code" in error);

const isDuplicateKeyError = (error: unknown): error is { code: 11000 } =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === 11000;

const toFiniteNumber = (value: unknown, name: string) => {
  const number = Number(value);
  if (!Number.isFinite(number))
    throw new HttpError(
      500,
      "INVALID_USAGE_CONFIGURATION",
      `Invalid numeric usage value: ${name}.`,
    );
  return number;
};

const fallbackReservation = (input: { userId: string; quantity: number; unit: UsageUnit }) => ({
  id: `usage-fallback:${randomUUID()}`,
  period: currentPeriod(),
  userId: input.userId,
  quantity: input.quantity,
  unit: input.unit,
});

export const reserveUsage = async (input: {
  userId: string;
  unit: UsageUnit;
  quantity: number;
  feature: UsageFeature;
  model: string;
  resourceId?: string;
}) => {
  const estimatedCost = Number(input.quantity);
  if (!Number.isFinite(estimatedCost) || !Number.isInteger(estimatedCost) || estimatedCost <= 0)
    throw new HttpError(400, "INVALID_USAGE_RESERVATION", "Invalid usage reservation.");

  try {
    const access = await getBillingAccess(input.userId);
    const period = currentPeriod(access.periodStart);
    const counterId = `${input.userId}:${period}:${input.unit}`;
    const limit = Number(toFiniteNumber(limits[access.plan][input.unit], "limit"));
    const maxAllowed = Number(limit - estimatedCost);

    // Never send an object, NaN, or Infinity as the comparison operand.
    if (typeof maxAllowed !== "number" || !Number.isFinite(maxAllowed))
      throw new HttpError(
        500,
        "INVALID_USAGE_CONFIGURATION",
        "Unable to calculate the usage allowance.",
      );
    if (maxAllowed < 0)
      throw new HttpError(402, "USAGE_LIMIT_EXCEEDED", `Monthly ${input.unit} allowance exceeded.`);

    const identity = { userId: input.userId, unit: input.unit, period };
    // sanitizeFilter is enabled globally. Mark this server-built operator as
    // trusted so Mongoose preserves `$lte` instead of wrapping it in `$eq`,
    // which would attempt to cast the whole operator object to Number.
    const filter = {
      ...identity,
      used: mongoose.trusted({ $lte: Number(maxAllowed) }),
    };
    const update = {
      $inc: { used: estimatedCost },
      $setOnInsert: { id: counterId, ...identity },
    };

    // Quota check and increment are atomic. Concurrent first-time upserts can
    // race on either unique index; retry the loser without upsert.
    let counter;
    try {
      counter = await UsageCounterModel.findOneAndUpdate(filter, update, {
        upsert: true,
        new: true,
        runValidators: true,
      }).lean();
    } catch (error) {
      if (!isDuplicateKeyError(error)) throw error;
      counter = await UsageCounterModel.findOneAndUpdate(
        filter,
        { $inc: { used: estimatedCost } },
        { new: true, runValidators: true },
      ).lean();
    }
    if (!counter)
      throw new HttpError(402, "USAGE_LIMIT_EXCEEDED", `Monthly ${input.unit} allowance exceeded.`);

    const reservation = await UsageModel.create({
      userId: input.userId,
      feature: input.feature,
      quantity: estimatedCost,
      reservedQuantity: estimatedCost,
      status: "reserved",
      unit: input.unit,
      model: input.model,
      resourceId: input.resourceId ?? null,
      period,
    });
    return { id: reservation.id, period };
  } catch (error) {
    if (error instanceof HttpError) throw error;
    if (isMongoError(error)) {
      console.error("[Usage reservation fallback] MongoDB usage reservation failed:", error);
      // Usage accounting must not take down an otherwise healthy AI request.
      return fallbackReservation(input);
    }
    throw error;
  }
};

export const releaseUsage = async (reservationId: string) => {
  if (reservationId.startsWith("usage-fallback:")) return;
  try {
    const reservation = (await UsageModel.findOneAndUpdate(
      { id: reservationId, status: "reserved" },
      { $set: { status: "released", quantity: 0 } },
      { new: false },
    ).lean()) as { userId: string; period: string; unit: UsageUnit; reservedQuantity: number } | null;
    if (!reservation) return;
    await UsageCounterModel.updateOne(
      {
        userId: reservation.userId,
        unit: reservation.unit,
        period: reservation.period,
      },
      { $inc: { used: -reservation.reservedQuantity } },
      { runValidators: true },
    );
  } catch (error) {
    console.error("[Usage release fallback] Usage reconciliation failed:", error);
  }
};

export const commitUsage = async (reservationId: string, actualQuantity: number) => {
  if (!Number.isInteger(actualQuantity) || actualQuantity < 0)
    throw new HttpError(500, "INVALID_USAGE_COMMIT", "Invalid usage commit.");
  if (reservationId.startsWith("usage-fallback:")) return;
try {
    const actual = Math.max(0, Number(actualQuantity) || 0);

    // Step 1: Find and update the reservation safely using primitive ID lookup
    let reservation = (await UsageModel.findOneAndUpdate(
      { id: reservationId, status: "reserved" },
      { $set: { status: "committed", quantity: actual } },
      { new: false }
    ).lean()) as {
      userId: string; period: string; unit: UsageUnit; reservedQuantity: number;
    } | null;

    if (!reservation) return;

    // Step 2: Reconcile the difference in UsageCounter atomically
    const reserved = Number(reservation.reservedQuantity) || 0;
    const delta = actual - reserved;

    if (delta !== 0) {
      await UsageCounterModel.updateOne(
        {
          userId: reservation.userId,
          unit: reservation.unit,
          period: reservation.period,
        },
        { $inc: { used: delta } }
      );
    }
  } catch (error) {
    console.error("[Usage commit fallback] Usage reconciliation failed:", error);
  }
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
