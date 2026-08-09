import "server-only";

import { v2 as cloudinary } from "cloudinary";
import Stripe from "stripe";
import { env } from "@/lib/env";

let stripeClient: Stripe | undefined;
let cloudinaryConfigured = false;

export class ProviderConfigurationError extends Error {
  constructor(
    public readonly provider: "Cloudinary" | "Stripe" | "Pollinations"
  ) {
    super(`${provider} is not configured.`);
    this.name = "ProviderConfigurationError";
  }
}

export const getCloudinary = () => {
  if (
    !env.CLOUDINARY_CLOUD_NAME ||
    !env.CLOUDINARY_API_KEY ||
    !env.CLOUDINARY_API_SECRET
  ) {
    throw new ProviderConfigurationError("Cloudinary");
  }
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

export const getStripe = (): Stripe => {
  const secretKey = env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new ProviderConfigurationError("Stripe");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: "2026-07-29.dahlia",
      appInfo: { name: "Luro AI" },
      maxNetworkRetries: 2,
    });
  }

  return stripeClient;
};

// Pollinations AI URL Generator (Fixed to public free endpoint)
export const getPollinationsImageUrl = (
  prompt: string,
  model?: string,
  size?: string
) => {
  const selectedModel = model || env.POLLINATIONS_IMAGE_MODEL || "flux";
  
  // DIRECT FREE PUBLIC ENDPOINT
  const baseUrl = "https://image.pollinations.ai/prompt";
  const [width, height] = (size || "1024x1024").split("x");

  const pollinationsUrl = new URL(`${baseUrl}/${encodeURIComponent(prompt)}`);
  pollinationsUrl.searchParams.append("model", selectedModel);
  pollinationsUrl.searchParams.append("width", width || "1024");
  pollinationsUrl.searchParams.append("height", height || "1024");
  pollinationsUrl.searchParams.append("nologo", "true");

  return pollinationsUrl.toString();
};