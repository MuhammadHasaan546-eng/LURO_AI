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
    // FIX 1: requireAiSession() ko bina 'request' argument ke call karein
    const session = await requireAiSession();
    await enforceAiRateLimit(session.userId, "image-regenerate");
    
    const input = await parseBody<{ imageId: string }>(
      request,
      regenerateImageSchema
    );

    await connectToDatabase();

    // FIX 2: _id aur custom id dono ko check karein taakay Image source safely mil sake
    const source = (await ImageModel.findOne({
      $or: [{ _id: input.imageId }, { id: input.imageId }],
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