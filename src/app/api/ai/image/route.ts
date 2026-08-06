import { imageSchema, type ImageInput } from "@/lib/ai/contracts";
import { createImage } from "@/lib/ai/images";
import {
  handleRouteError,
  parseBody,
  parseHistoryQuery,
  requireAiSession,
} from "@/lib/ai/http";
import { enforceAiRateLimit, trustedBeforeFilter } from "@/lib/ai/usage";
import { connectToDatabase } from "@/lib/mongoose";
import { ImageModel } from "@/models";
import { successResponse } from "@/lib/api-response";

export const runtime = "nodejs";

// Image generation ko timeout se bachane ke liye max duration badhayen (seconds me)
export const maxDuration = 60; 

export async function GET(request: Request) {
  try {
    const session = await requireAiSession();
    const { limit, before } = parseHistoryQuery(request);
    await connectToDatabase();
    
    const items = await ImageModel.find({
      userId: session.userId,
      ...trustedBeforeFilter(before),
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
      
    return successResponse(items, "Image history loaded.");
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAiSession();
    
    // Safety check: Database connection ensure karein
    await connectToDatabase();

    await enforceAiRateLimit(session.userId, "image");
    
    const input = await parseBody<ImageInput>(request, imageSchema);
    
    // Internal image creation call
    const image = await createImage(session.userId, input);
    
    return successResponse(image, "Image generated.", 201);
  } catch (error) {
    // Exact failure point dekhne ke liye server side par log karein
    console.error("[POST /api/ai/image Error]:", error);
    return handleRouteError(error);
  }
}