import { regenerateImageSchema } from "@/lib/ai/contracts";
import { createImage } from "@/lib/ai/images";
import {
  handleRouteError,
  HttpError,
  parseBody,
  requireAiSession,
} from "@/lib/ai/http";
import { enforceAiRateLimit } from "@/lib/ai/usage";
import { connectToDatabase } from "@/lib/mongoose";
import { ImageModel, type Image } from "@/models";
import { successResponse } from "@/lib/api-response";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await requireAiSession(request);
    await enforceAiRateLimit(session.userId, "image-regenerate");
    const input = await parseBody<{ imageId: string }>(
      request,
      regenerateImageSchema,
    );
    await connectToDatabase();
    const source = (await ImageModel.findOne({
      id: input.imageId,
      userId: session.userId,
    }).lean()) as Image | null;
    if (!source) throw new HttpError(404, "NOT_FOUND", "Image not found.");
    const image = await createImage(session.userId, {
      prompt: source.prompt,
      category: source.category,
      size: source.size,
      quality: source.quality,
    });
    return successResponse(image, "Image regenerated.", 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
