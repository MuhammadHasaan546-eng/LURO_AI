import "server-only";

import { v2 as cloudinary } from "cloudinary";
import OpenAI from "openai";
import Stripe from "stripe";
import { env } from "@/lib/env";

let openAIClient: OpenAI | undefined;
let stripeClient: Stripe | undefined;
let cloudinaryConfigured = false;

export class ProviderConfigurationError extends Error {
  constructor(public readonly provider: "OpenAI" | "Cloudinary" | "Stripe") {
    super(`${provider} is not configured.`);
    this.name = "ProviderConfigurationError";
  }
}

export const getOpenAI = () => {
  if (!env.OPENAI_API_KEY) throw new ProviderConfigurationError("OpenAI");
  openAIClient ??= new OpenAI({
    apiKey: env.OPENAI_API_KEY,
    baseURL: env.OPENAI_BASE_URL,
    timeout: 60_000,
    maxRetries: 2,
    defaultHeaders: {
      "HTTP-Referer": env.APP_URL,
      "X-Title": "Luro AI",
    },
  });
  return openAIClient;
};

export const getCloudinary = () => {
  if (
    !env.CLOUDINARY_CLOUD_NAME ||
    !env.CLOUDINARY_API_KEY ||
    !env.CLOUDINARY_API_SECRET
  )
    throw new ProviderConfigurationError("Cloudinary");
  if (!cloudinaryConfigured) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    cloudinaryConfigured = true;
  }
  return cloudinary;
};

export const getStripe = () => {
  if (!env.STRIPE_SECRET_KEY) throw new ProviderConfigurationError("Stripe");
  stripeClient ??= new Stripe(env.STRIPE_SECRET_KEY, {
    appInfo: { name: "Luro AI" },
    maxNetworkRetries: 2,
  });
  return stripeClient;
};
