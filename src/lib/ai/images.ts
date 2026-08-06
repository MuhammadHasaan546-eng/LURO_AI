// src/lib/ai/images.ts
import "server-only";

import { env } from "@/lib/env";
import type { ImageInput } from "@/lib/ai/contracts";
import { getCloudinary, getPollinationsImageUrl } from "@/lib/ai/providers";
import { assertUsageAvailable, recordUsage } from "@/lib/ai/usage";
import { HttpError } from "@/lib/ai/http";
import { connectToDatabase } from "@/lib/mongoose";
import { ImageModel } from "@/models";

export const createImage = async (userId: string, input: ImageInput) => {
  await assertUsageAvailable(userId, "images", 1);

  const selectedModel = env.POLLINATIONS_IMAGE_MODEL || "flux";

  // 1. Pollinations AI se public direct Image URL banayein
  const imageUrl = getPollinationsImageUrl(
    input.prompt,
    selectedModel,
    input.size || "1024x1024"
  );

  if (!imageUrl) {
    throw new HttpError(
      502,
      "EMPTY_PROVIDER_RESPONSE",
      "Image provider returned no image."
    );
  }

  // 2. Pollinations se image fetch karein (Browser Headers added to bypass 403 Cloudflare block)
  let imageResponse: Response;
  try {
    imageResponse = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        Referer: "https://pollinations.ai/",
      },
      // Timeout handle karne ke liye (15 seconds)
      signal: AbortSignal.timeout(15000),
    });
  } catch (err: any) {
    console.error("[Pollinations Network Error]:", err);
    throw new HttpError(
      504,
      "PROVIDER_TIMEOUT",
      "Failed to connect to Pollinations image server."
    );
  }

  if (!imageResponse.ok) {
    console.error(
      "[Pollinations Fetch Error]:",
      imageResponse.status,
      imageResponse.statusText
    );
    throw new HttpError(
      502,
      "PROVIDER_ERROR",
      `Pollinations API failed with status: ${imageResponse.status}`
    );
  }

  const arrayBuffer = await imageResponse.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Image = `data:image/jpeg;base64,${buffer.toString("base64")}`;

  // 3. Base64 Image ko Cloudinary par upload karein
  const uploaded = await getCloudinary().uploader.upload(base64Image, {
    folder: `luro-ai/${userId}`,
    resource_type: "image",
    overwrite: false,
  });

  // 4. Database (MongoDB) mein save karein
  await connectToDatabase();
  const image = await ImageModel.create({
    userId,
    ...input,
    enhancedPrompt: null,
    cloudinaryPublicId: uploaded.public_id,
    secureUrl: uploaded.secure_url,
    width: uploaded.width,
    height: uploaded.height,
    model: `pollinations/${selectedModel}`,
  });

  // 5. Usage Track karein
  await recordUsage({
    userId,
    feature: "image",
    quantity: 1,
    unit: "images",
    model: `pollinations/${selectedModel}`,
    resourceId: image.id,
  });

  return image;
};