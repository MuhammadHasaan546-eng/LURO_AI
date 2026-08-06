import "server-only";

import { v2 as cloudinary } from "cloudinary";
import Stripe from "stripe";
import { env } from "@/lib/env";

let stripeClient: Stripe | undefined;
let cloudinaryConfigured = false;

export class ProviderConfigurationError extends Error {
  constructor(public readonly provider: "Cloudinary" | "Stripe") {
    super(`${provider} is not configured.`);
    this.name = "ProviderConfigurationError";
  }
}

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