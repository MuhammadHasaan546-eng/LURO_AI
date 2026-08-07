import "server-only";

import https from "node:https";
import axios, { AxiosError } from "axios";
import { env } from "@/lib/env";
import type { ImageInput } from "@/lib/ai/contracts";
import { getCloudinary, getPollinationsImageUrl } from "@/lib/ai/providers";
import { assertUsageAvailable, recordUsage } from "@/lib/ai/usage";
import { HttpError } from "@/lib/ai/http";
import { connectToDatabase } from "@/lib/mongoose";
import { ImageModel } from "@/models";

const pollinationsAgent = new https.Agent({
  family: 4,
  autoSelectFamily: false,
  keepAlive: true,
});

const downloadPollinationsImage = async (imageUrl: string) => {
  try {
    const response = await axios.get<ArrayBuffer>(imageUrl, {
      responseType: "arraybuffer",
      timeout: 30_000,
      maxContentLength: 25_000_000,
      maxBodyLength: 25_000_000,
      httpsAgent: pollinationsAgent,
      headers: {
        "User-Agent": "Luro-AI/1.0",
        Accept: "image/*",
      },
    });

    const contentType = String(response.headers["content-type"] ?? "");
    if (!contentType.toLowerCase().startsWith("image/")) {
      throw new HttpError(
        502,
        "INVALID_PROVIDER_RESPONSE",
        "Image provider returned an invalid response.",
      );
    }

    return {
      buffer: Buffer.from(response.data),
      contentType: contentType.split(";", 1)[0],
    };
  } catch (error) {
    if (error instanceof HttpError) throw error;

    const providerError = error as AxiosError;
    console.error("[Pollinations Request Error]:", {
      code: providerError.code,
      status: providerError.response?.status,
      message: providerError.message,
    });

    if (
      providerError.code === AxiosError.ETIMEDOUT ||
      providerError.code === AxiosError.ECONNABORTED
    ) {
      throw new HttpError(
        504,
        "PROVIDER_TIMEOUT",
        "Pollinations image server timed out.",
      );
    }

    if (providerError.response) {
      throw new HttpError(
        502,
        "PROVIDER_ERROR",
        `Pollinations API failed with status: ${providerError.response.status}`,
      );
    }

    throw new HttpError(
      503,
      "PROVIDER_UNAVAILABLE",
      "Failed to connect to Pollinations image server.",
    );
  }
};

type CloudinaryUploadError = Error & {
  http_code?: number;
};

const uploadImage = async (userId: string, base64Image: string) => {
  try {
    return await getCloudinary().uploader.upload(base64Image, {
      folder: `luro-ai/${userId}`,
      resource_type: "image",
      overwrite: false,
    });
  } catch (error) {
    const uploadError = error as CloudinaryUploadError;
    console.error("[Cloudinary Upload Error]:", {
      name: uploadError.name,
      status: uploadError.http_code,
      message: uploadError.message,
    });

    if (uploadError.http_code === 401 || uploadError.http_code === 403) {
      throw new HttpError(
        503,
        "IMAGE_STORAGE_PERMISSION_DENIED",
        "Image storage credentials do not have upload permission.",
      );
    }

    throw new HttpError(
      502,
      "IMAGE_STORAGE_ERROR",
      "Failed to store the generated image.",
    );
  }
};

export const createImage = async (userId: string, input: ImageInput) => {
  await assertUsageAvailable(userId, "images", 1);

  const selectedModel = env.POLLINATIONS_IMAGE_MODEL || "flux";
  const imageUrl = getPollinationsImageUrl(
    input.prompt,
    selectedModel,
    input.size || "1024x1024",
  );
  const { buffer, contentType } = await downloadPollinationsImage(imageUrl);
  const base64Image = `data:${contentType};base64,${buffer.toString("base64")}`;

  const uploaded = await uploadImage(userId, base64Image);

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