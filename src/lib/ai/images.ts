import "server-only";

import { env } from "@/lib/env";
import type { ImageInput } from "@/lib/ai/contracts";
import { getCloudinary, getOpenAI } from "@/lib/ai/providers";
import { assertUsageAvailable, recordUsage } from "@/lib/ai/usage";
import { HttpError } from "@/lib/ai/http";
import { connectToDatabase } from "@/lib/mongoose";
import { ImageModel } from "@/models";

export const createImage = async (userId: string, input: ImageInput) => {
  await assertUsageAvailable(userId, "images", 1);
  const response = await getOpenAI().images.generate({
    model: env.OPENAI_IMAGE_MODEL,
    prompt: input.prompt,
    size: input.size,
    quality: input.quality,
    response_format: "b64_json",
  });
  const encoded = response.data?.[0]?.b64_json;
  if (!encoded)
    throw new HttpError(
      502,
      "EMPTY_PROVIDER_RESPONSE",
      "Image provider returned no image.",
    );
  const uploaded = await getCloudinary().uploader.upload(
    `data:image/png;base64,${encoded}`,
    {
      folder: `luro-ai/${userId}`,
      resource_type: "image",
      overwrite: false,
    },
  );
  await connectToDatabase();
  const image = await ImageModel.create({
    userId,
    ...input,
    enhancedPrompt: response.data?.[0]?.revised_prompt ?? null,
    cloudinaryPublicId: uploaded.public_id,
    secureUrl: uploaded.secure_url,
    width: uploaded.width,
    height: uploaded.height,
    model: env.OPENAI_IMAGE_MODEL,
  });
  await recordUsage({
    userId,
    feature: "image",
    quantity: 1,
    unit: "images",
    model: env.OPENAI_IMAGE_MODEL,
    resourceId: image.id,
  });
  return image;
};
